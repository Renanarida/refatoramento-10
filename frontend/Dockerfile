# ---------- Build stage ----------
FROM node:20-alpine AS build
WORKDIR /app

# Copia só os manifests para aproveitar cache de dependências
COPY package*.json ./
# Usa o lockfile para instalações determinísticas
RUN npm ci

# Agora copia o resto do código
COPY . .
# Build de produção
RUN npm run build

# ---------- Production stage ----------
FROM node:20-alpine AS production
WORKDIR /app

# Servidor estático simples
RUN npm install -g serve

# Copia apenas os artefatos de build
COPY --from=build /app/dist ./dist

EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000", "--single"]
