FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependencias
COPY package.json package-lock.json* ./
RUN npm install

# Generar el cliente de Prisma
COPY prisma ./prisma/
RUN npx prisma generate

# Copiar el resto del código y construir
COPY . .
RUN npm run build

# ----- Production stage -----
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json* ./
RUN npm install --production

# Copiar la build y Prisma
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"
ENV NODE_ENV production

# Al iniciar el contenedor, aplicamos los cambios de base de datos (db push) y corremos la app
CMD ["sh", "-c", "npx prisma db push && npm run start"]
