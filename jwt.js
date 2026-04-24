const { query } = require('../database/db');
const logger = require('../utils/logger');

/**
 * GET /api/memory - List user memory entries
 */
const listMemory = async (req, res) => {
  const { category, search } = req.query;

  let sql = 'SELECT * FROM user_memory WHERE user_id = $1';
  const params = [req.user.id];

  if (category) {
    params.push(category);
    sql += ` AND category = $${params.length}`;
  }

  if (search) {
    params.push(`%${search}%`);
    sql += ` AND (key ILIKE $${params.length} OR value ILIKE $${params.length})`;
  }

  sql += ' ORDER BY updated_at DESC';

  const result = await query(sql, params);
  return res.json({ memories: result.rows });
};

/**
 * POST /api/memory - Create/update memory entry
 */
const upsertMemory = async (req, res) => {
  const { key, value, category = 'general', tags, expiresAt } = req.body;

  try {
    const result = await query(
      `INSERT INTO user_memory (user_id, key, value, category, tags, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id, key) DO UPDATE
       SET value = EXCLUDED.value,
           category = EXCLUDED.category,
           tags = EXCLUDED.tags,
           expires_at = EXCLUDED.expires_at,
           updated_at = NOW()
       RETURNING *`,
      [req.user.id, key, value, category, tags, expiresAt || null]
    );

    return res.status(201).json({ memory: result.rows[0] });
  } catch (error) {
    logger.error('Upsert memory error', { error: error.message });
    return res.status(500).json({ error: 'Failed to save memory' });
  }
};

/**
 * DELETE /api/memory/:id
 */
const deleteMemory = async (req, res) => {
  const result = await query(
    'DELETE FROM user_memory WHERE id = $1 AND user_id = $2 RETURNING id',
    [req.params.id, req.user.id]
  );

  if (!result.rows[0]) {
    return res.status(404).json({ error: 'Memory entry not found' });
  }

  return res.json({ message: 'Memory deleted' });
};

/**
 * GET /api/memory/categories
 */
const getCategories = async (req, res) => {
  const result = await query(
    'SELECT DISTINCT category, COUNT(*) as count FROM user_memory WHERE user_id = $1 GROUP BY category',
    [req.user.id]
  );

  return res.json({ categories: result.rows });
};

/**
 * DELETE /api/memory/clear - Clear all memory (with confirmation)
 */
const clearMemory = async (req, res) => {
  const { confirm } = req.body;
  if (confirm !== 'CLEAR_ALL') {
    return res.status(400).json({ error: 'Send confirm: "CLEAR_ALL" to clear all memories' });
  }

  await query('DELETE FROM user_memory WHERE user_id = $1', [req.user.id]);
  logger.info('User cleared all memory', { userId: req.user.id });
  return res.json({ message: 'All memories cleared' });
};

module.exports = { listMemory, upsertMemory, deleteMemory, getCategories, clearMemory };
