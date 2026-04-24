const { query } = require('../database/db');
const { runSingleAgent, runRaceMode, runDebateMode, runChainMode, judgeResponses, saveConversation } = require('../services/orchestrator');
const { PROVIDER_MODELS } = require('../services/providers');
const logger = require('../utils/logger');

/**
 * POST /api/orchestrate/run - Run agents (single or parallel)
 */
const run = async (req, res) => {
  const { prompt, agents, mode = 'single', options = {} } = req.body;
  const userId = req.user.id;

  try {
    // Build message array
    const messages = options.history || [];
    messages.push({ role: 'user', content: prompt });

    // Fetch agent configs from DB (ensure they belong to this user)
    const agentIds = agents.map((a) => a.id || a);
    const agentResult = await query(
      `SELECT * FROM agent_configs WHERE id = ANY($1::uuid[]) AND user_id = $2`,
      [agentIds, userId]
    );

    if (agentResult.rows.length === 0) {
      return res.status(400).json({ error: 'No valid agent configurations found' });
    }

    const agentConfigs = agentResult.rows;

    let results;
    const startTime = Date.now();

    switch (mode) {
      case 'race':
        results = await runRaceMode(userId, agentConfigs, messages);
        break;
      case 'debate':
        results = await runDebateMode(userId, agentConfigs, prompt, options.rounds || 2);
        break;
      case 'chain':
        results = await runChainMode(userId, agentConfigs, prompt);
        break;
      case 'single':
      default:
        const singleResult = await runSingleAgent(userId, agentConfigs[0], messages);
        results = [singleResult];
        break;
    }

    const totalTime = Date.now() - startTime;

    // Get AI judgement if multiple results and judge requested
    let judgement = null;
    if (options.judge && results.length > 1) {
      const successResults = results.filter((r) => r.success !== false);
      if (successResults.length > 1) {
        judgement = await judgeResponses(userId, successResults, prompt).catch(() => null);
      }
    }

    // Save to conversation if requested
    let conversationId = null;
    if (options.saveConversation) {
      conversationId = await saveConversation(
        userId,
        options.title,
        mode,
        options.tabType || 'chat',
        messages,
        Array.isArray(results[0]) ? results.flat() : results
      ).catch((err) => {
        logger.error('Failed to save conversation', { error: err.message });
        return null;
      });
    }

    logger.info('Orchestration complete', {
      userId,
      mode,
      agentCount: agentConfigs.length,
      totalTime,
    });

    return res.json({
      mode,
      results,
      judgement,
      conversationId,
      totalTimeMs: totalTime,
      agentCount: agentConfigs.length,
    });
  } catch (error) {
    logger.error('Orchestration error', { error: error.message, userId });
    return res.status(500).json({ error: 'Orchestration failed: ' + error.message });
  }
};

/**
 * GET /api/orchestrate/models - Get available models per provider
 */
const getModels = async (req, res) => {
  // Only return models for providers the user has keys for
  const keysResult = await query(
    'SELECT DISTINCT provider FROM api_keys WHERE user_id = $1 AND is_active = true',
    [req.user.id]
  );

  const availableProviders = keysResult.rows.map((r) => r.provider);
  
  const availableModels = {};
  for (const provider of availableProviders) {
    if (PROVIDER_MODELS[provider]) {
      availableModels[provider] = PROVIDER_MODELS[provider];
    }
  }

  return res.json({ models: availableModels, providers: availableProviders });
};

/**
 * GET /api/orchestrate/agents - List user's agent configs
 */
const listAgents = async (req, res) => {
  const result = await query(
    `SELECT id, name, provider, model, temperature, max_tokens, system_prompt, is_active, created_at
     FROM agent_configs WHERE user_id = $1 ORDER BY created_at DESC`,
    [req.user.id]
  );

  return res.json({ agents: result.rows });
};

/**
 * POST /api/orchestrate/agents - Create agent config
 */
const createAgent = async (req, res) => {
  const { name, provider, model, systemPrompt, temperature = 0.7, maxTokens = 2048 } = req.body;

  try {
    const result = await query(
      `INSERT INTO agent_configs (user_id, name, provider, model, system_prompt, temperature, max_tokens)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [req.user.id, name, provider, model, systemPrompt, temperature, maxTokens]
    );

    return res.status(201).json({ agent: result.rows[0] });
  } catch (error) {
    logger.error('Create agent error', { error: error.message });
    return res.status(500).json({ error: 'Failed to create agent' });
  }
};

/**
 * PUT /api/orchestrate/agents/:id - Update agent config
 */
const updateAgent = async (req, res) => {
  const { name, model, systemPrompt, temperature, maxTokens, isActive } = req.body;

  try {
    const result = await query(
      `UPDATE agent_configs
       SET name = COALESCE($1, name),
           model = COALESCE($2, model),
           system_prompt = COALESCE($3, system_prompt),
           temperature = COALESCE($4, temperature),
           max_tokens = COALESCE($5, max_tokens),
           is_active = COALESCE($6, is_active)
       WHERE id = $7 AND user_id = $8
       RETURNING *`,
      [name, model, systemPrompt, temperature, maxTokens, isActive, req.params.id, req.user.id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    return res.json({ agent: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update agent' });
  }
};

/**
 * DELETE /api/orchestrate/agents/:id
 */
const deleteAgent = async (req, res) => {
  const result = await query(
    'DELETE FROM agent_configs WHERE id = $1 AND user_id = $2 RETURNING id',
    [req.params.id, req.user.id]
  );

  if (!result.rows[0]) {
    return res.status(404).json({ error: 'Agent not found' });
  }

  return res.json({ message: 'Agent deleted' });
};

/**
 * GET /api/orchestrate/conversations - List conversations
 */
const listConversations = async (req, res) => {
  const result = await query(
    `SELECT id, title, mode, tab_type, created_at, updated_at
     FROM conversations WHERE user_id = $1 AND is_archived = false
     ORDER BY updated_at DESC LIMIT 50`,
    [req.user.id]
  );

  return res.json({ conversations: result.rows });
};

/**
 * GET /api/orchestrate/conversations/:id - Get conversation with messages
 */
const getConversation = async (req, res) => {
  const convResult = await query(
    'SELECT * FROM conversations WHERE id = $1 AND user_id = $2',
    [req.params.id, req.user.id]
  );

  if (!convResult.rows[0]) {
    return res.status(404).json({ error: 'Conversation not found' });
  }

  const msgResult = await query(
    'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at',
    [req.params.id]
  );

  return res.json({ conversation: convResult.rows[0], messages: msgResult.rows });
};

module.exports = {
  run,
  getModels,
  listAgents,
  createAgent,
  updateAgent,
  deleteAgent,
  listConversations,
  getConversation,
};
