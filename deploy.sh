#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SSH_KEY="$ROOT/ssh/deploy"
REMOTE="root@159.194.227.33"
CONTAINER="deploy-temp"
REMOTE_SITE="/tmp/site"
SITE_URL="https://atpm-mould.ru/"

SSH_CMD=(ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no -o ConnectTimeout=30)

if [[ ! -f "$SSH_KEY" ]]; then
  echo "SSH key not found: $SSH_KEY" >&2
  exit 1
fi

echo "==> Building Astro site"
cd "$ROOT/astro"
npm run build

echo "==> Uploading dist to $REMOTE:$REMOTE_SITE"
rsync -az --delete \
  -e "ssh -i $SSH_KEY -o StrictHostKeyChecking=no -o ConnectTimeout=30" \
  "$ROOT/astro/dist/" \
  "$REMOTE:$REMOTE_SITE/"

echo "==> Deploying to container $CONTAINER"
"${SSH_CMD[@]}" "$REMOTE" bash -s <<EOF
set -euo pipefail
docker exec $CONTAINER sh -lc 'find /usr/share/nginx/html -mindepth 1 -maxdepth 1 ! -name 50x.html -exec rm -rf {} +'
docker cp $REMOTE_SITE/. $CONTAINER:/usr/share/nginx/html/
docker exec $CONTAINER sh -lc 'find /usr/share/nginx/html -type d -exec chmod 755 {} +; find /usr/share/nginx/html -type f -exec chmod 644 {} +'
EOF

echo "==> Done: $SITE_URL"
curl --max-time 15 -sI "$SITE_URL" | head -1 || true
