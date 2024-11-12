# Étape 1 : Construction de l'application
FROM node:18-alpine AS builder

WORKDIR /app
COPY package-docker.json ./package.json
COPY package-lock.json ./package-lock.json
COPY .env.docker ./.env
RUN npm ci --verbose

COPY . .

RUN npm run build

# Étape 2 : Création de l'image finale
FROM node:18-alpine

WORKDIR /app


COPY package-lock.json ./package-lock.json
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/next.config.js ./next.config.js
COPY .env.docker ./.env
COPY --from=builder /app/tailwind.config.js ./tailwind.config.js

ENV NODE_ENV=production

EXPOSE 3000

# Commande de démarrage
CMD ["npm", "run", "start"]
