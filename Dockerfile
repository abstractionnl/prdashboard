FROM node:22-alpine AS build
WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm install

COPY src ./src/
COPY *.json ./

RUN npm run build-prod

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /usr/src/app/dist/prdashboard/browser /usr/share/nginx/html