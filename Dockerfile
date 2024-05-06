FROM node:latest

WORKDIR /app

COPY . .

RUN npm install --only=production

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]