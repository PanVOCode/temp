# Деплой АДДИТЕХПРОММАШ

**Сервер:** `root@159.194.227.33`  
**SSH-ключ:** `ssh/deploy`  
**Контейнер:** `deploy-additehpr-00001`  
**Сайт:** https://atpm-mold.ru

## Полный деплой (index.html + assets)

```bash
# 1. Копируем файлы на сервер
rsync -az -e "ssh -i ssh/deploy -o StrictHostKeyChecking=no" \
  index.html assets/ \
  root@159.194.227.33:/tmp/site/

# 2. Копируем из /tmp в контейнер и фиксим права
ssh -i ssh/deploy -o StrictHostKeyChecking=no root@159.194.227.33 "
  docker cp /tmp/site/index.html deploy-additehpr-00001:/usr/share/nginx/html/index.html
  docker cp /tmp/site/. deploy-additehpr-00001:/usr/share/nginx/html/assets/
  docker exec deploy-additehpr-00001 find /usr/share/nginx/html -type d -exec chmod 755 {} \;
  docker exec deploy-additehpr-00001 find /usr/share/nginx/html -type f -exec chmod 644 {} \;
"
```

## Быстрый деплой (только index.html)

```bash
rsync -az -e "ssh -i ssh/deploy -o StrictHostKeyChecking=no" \
  index.html root@159.194.227.33:/tmp/site/

ssh -i ssh/deploy -o StrictHostKeyChecking=no root@159.194.227.33 "
  docker cp /tmp/site/index.html deploy-additehpr-00001:/usr/share/nginx/html/index.html
  docker exec deploy-additehpr-00001 chmod 644 /usr/share/nginx/html/index.html
"
```

## Восстановление с сервера

```bash
# Скопировать файлы из контейнера в локальную папку
ssh -i ssh/deploy -o StrictHostKeyChecking=no root@159.194.227.33 "
  docker cp deploy-additehpr-00001:/usr/share/nginx/html /tmp/site-backup
"

rsync -az -e "ssh -i ssh/deploy -o StrictHostKeyChecking=no" \
  root@159.194.227.33:/tmp/site-backup/ ./
```

## Важно

- `chmod -R 644` ломает директории — никогда не использовать на папках. Только раздельно: `find -type d chmod 755` и `find -type f chmod 644`.
- SSH-ключ лежит в `ssh/deploy` — не удалять.
- `50x.html` в корне — nginx-заглушка для ошибок 5xx, не нужна для работы сайта.
