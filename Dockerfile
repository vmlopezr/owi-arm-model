FROM node:14.3.0-alpine3.10 as development

WORKDIR /usr/src/app
COPY docker/package-docker.json /usr/src/app/package.json
ADD public /usr/src/app/public
ADD src /usr/src/app/src
RUN yarn install
RUN yarn build

FROM nginx:1.17.10-alpine

WORKDIR /usr/src/app
COPY --from=development /usr/src/app/build /var/www/build
COPY --from=development /usr/src/app/public /var/www/public
COPY docker/mime.types /var/www/

# Replace default nginx configuration file
ADD docker/nginx.conf /etc/nginx/nginx.conf

EXPOSE 3000
ENTRYPOINT [ "nginx", "-g", "daemon off;" ]


