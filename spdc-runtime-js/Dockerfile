FROM node:18-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .
RUN rm -rf .mf

FROM node:18-slim


WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app ./

ENV PORT=8787

EXPOSE 8787
EXPOSE 8788

CMD ["node", "run.js"]
