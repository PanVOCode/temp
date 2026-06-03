ARG NODE_IMAGE=deploy-node:22-alpine
ARG NGINX_IMAGE=deploy-nginx:alpine
FROM ${NODE_IMAGE} AS builder
RUN corepack enable && corepack prepare pnpm@10.29.3 --activate
WORKDIR /app
COPY package.cache.json package.json
COPY pnpm-lock.yaml* ./
RUN echo 'dangerously-allow-all-builds=true' >> .npmrc
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    env CI=1 NO_UPDATE_NOTIFIER=1 sh -c '(test -f pnpm-lock.yaml && pnpm install --frozen-lockfile --prefer-offline || pnpm install --prefer-offline)'
COPY . .
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    --mount=type=cache,target=/app/.astro,id=astro-ooo-npk-additekhpr-5e4f65d2 \
    env CI=1 PAGE_HASH=ooo-npk-additekhpr-5e4f65d2 pnpm run build
RUN test -d dist || (echo "ERROR: dist not found" && exit 1)
    RUN if [ -n "atpm-mold.ru" ]; then test -f dist/sitemap.xml || test -f dist/sitemap-index.xml || (echo "Warning: Sitemap not found in dist/. Search engines may not index all pages." >&2); fi
RUN if [ -f /app/obfuscate_css.js ]; then cp /app/obfuscate_css.js /tmp/obfuscate_css.cjs && node /tmp/obfuscate_css.cjs /app/dist ooo-npk-additekhpr-5e4f65d2; else touch /app/css_bundle.txt; fi

FROM ${NGINX_IMAGE}
COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder /app/css_bundle.txt /css_bundle.txt
RUN echo 'server { listen 8000; root /usr/share/nginx/html; index index.html; location = /sitemap.xml { default_type application/xml; try_files /sitemap-index.xml /sitemap.xml =404; } location / { try_files $uri $uri/ /index.html; } gzip on; }' > /etc/nginx/conf.d/default.conf
EXPOSE 8000
CMD ["nginx", "-g", "daemon off;"]
