# ----------
# base layer
FROM public.ecr.aws/docker/library/node:22.13-alpine AS base
ENV NODE_ENV=production COREPACK_INTEGRITY_KEYS=0
RUN corepack enable

# -------------
# builder layer
FROM base AS builder
WORKDIR /src

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts

COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src
RUN pnpm build && \
    pnpm prune --prod --no-optional --ignore-scripts && \
    cp -al ./src/generated/client/*-linux-musl-*.so.node ./dist/generated/client/

# -------------
# runtime layer
FROM base AS runtime
WORKDIR /app
RUN apk add --no-cache tzdata tini
COPY --from=builder /src/node_modules /app/node_modules
COPY --from=builder /src/dist /app

ENV CLIENT_ID= DISCORD_TOKEN= GUILD_ID= CRIME_CHANNEL_ID=
ENV DATABASE_URL=file:/data/hebby.db
VOLUME /data

CMD ["pnpm", "start"]
ENTRYPOINT ["/sbin/tini", "--"]
