FROM node:20-alpine AS builder

WORKDIR /app

ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

COPY package*.json ./
RUN npm ci

COPY public/ ./public/
COPY src/ ./src/

RUN npm run build

# Production image
FROM nginx:alpine

COPY --from=builder /app/build /usr/share/nginx/html
COPY docker/nginx-frontend.conf /etc/nginx/conf.d/default.conf

RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
