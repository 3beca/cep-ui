FROM nginx:1.16.1

COPY ./build /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d