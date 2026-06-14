ARG NGINX_IMAGE=deploy-nginx:alpine
FROM ${NGINX_IMAGE}
COPY index.html /usr/share/nginx/html/
COPY assets /usr/share/nginx/html/assets/
RUN echo 'server { listen 8000; root /usr/share/nginx/html; index index.html; location / { try_files $uri $uri/ /index.html; } gzip on; }' > /etc/nginx/conf.d/default.conf
EXPOSE 8000
CMD ["nginx", "-g", "daemon off;"]
