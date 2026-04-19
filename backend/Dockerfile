# ─────────────────────────────────────────────────────────────────
# Stage 1: Build
# ─────────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# System-Dependencies für Prisma
RUN apk add --no-cache openssl

# Nur package-files zuerst — besseres Layer-Caching
COPY package*.json ./
COPY prisma ./prisma/

# Alle Dependencies installieren (inkl. devDeps für Build)
RUN npm ci

# Prisma Client vor TypeScript-Build generieren
RUN npx prisma generate

# TypeScript-Quellcode
COPY tsconfig.json ./
COPY src ./src/

# Build
RUN npm run build

# ─────────────────────────────────────────────────────────────────
# Stage 2: Production (minimale Image-Größe)
# ─────────────────────────────────────────────────────────────────
FROM node:22-alpine

WORKDIR /app

# wget für Health-Check, openssl für Prisma
RUN apk add --no-cache openssl wget

# Nur Production-Dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Prisma Schema + Migrations (für migrate deploy zur Laufzeit)
COPY --from=builder /app/prisma ./prisma/

# Generierten Prisma-Client aus Build-Stage übernehmen
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma/
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client/

# Kompilierter Code
COPY --from=builder /app/dist ./dist/

# Start-Script
COPY start.sh ./
RUN chmod +x start.sh

# Verzeichnisse vorab erstellen
RUN mkdir -p /app/uploads /app/prisma/data

EXPOSE 5000

CMD ["./start.sh"]
