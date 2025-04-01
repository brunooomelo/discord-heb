# ----------
# base layer
FROM public.ecr.aws/docker/library/node:22.13-alpine AS base
ENV NODE_ENV=production

# -------------
# builder layer
FROM base AS builder
WORKDIR /src

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --ignore-scripts

COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src
RUN yarn build

# -------------
# runtime layer
FROM base AS runtime
RUN apk add --no-cache tzdata tini
COPY --from=builder /src/node_modules /app/node_modules
COPY --from=builder /src/dist /app

ENV CLIENT_ID= DISCORD_TOKEN= GUILD_ID= CRIME_CHANNEL_ID=
ENV DATABASE_URL=file:/data/hebby.db
VOLUME /data

CMD ["node", "/app/index.js"]
ENTRYPOINT ["/sbin/tini", "--"]
