FROM node:16-alpine AS build
WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm install

COPY src ./src/
COPY *.json ./

RUN npm run build-prod

FROM nginx:1.21-alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /usr/src/app/dist/prdashboard /usr/share/nginx/html