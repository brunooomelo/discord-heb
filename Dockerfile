# ----------
# base layer
FROM public.ecr.aws/docker/library/node:22.13-alpine AS base
ENV NODE_ENV=production COREPACK_INTEGRITY_KEYS=0
WORKDIR /app
COPY ./package.json ./
RUN corepack enable && corepack install

# -------------
# builder layer
FROM base AS builder
WORKDIR /src
COPY package.json pnpm-lock.yaml tsconfig.json ./
RUN pnpm install --frozen-lockfile --ignore-scripts

COPY prisma ./prisma
COPY src ./src
RUN pnpm build && pnpm prune --prod --no-optional --ignore-scripts && \
    find ./src/generated -type f \( -iname "*.ts" -o -iname "*.json" \) -delete && \
    cp -al ./src/generated/ ./dist/generated/

# -------------
# runtime layer
FROM base AS runtime
RUN apk add --no-cache tzdata tini

COPY --from=builder /src/node_modules ./node_modules
COPY --from=builder /src/prisma ./prisma
COPY --from=builder /src/dist ./dist

ENV CLIENT_ID= DISCORD_TOKEN= GUILD_ID= CRIME_CHANNEL_ID=
ENV DATABASE_URL=file:/data/hebby.db
VOLUME /data

CMD ["pnpm", "start"]
ENTRYPOINT ["/sbin/tini", "--"]
