FROM node:latest

WORKDIR /app

COPY package.json package-lock.json ./
COPY dist ./dist
COPY .env.production .env

RUN npm install --omit=dev

EXPOSE 3000

CMD ["npm", "start"]