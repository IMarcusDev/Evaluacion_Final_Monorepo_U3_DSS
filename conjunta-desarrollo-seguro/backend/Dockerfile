#Marcos Escobar
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

RUN mkdir -p uploads \
  && addgroup -g 1001 -S app \
  && adduser  -u 1001 -S app -G app \
  && chown -R app:app /app
USER app

EXPOSE 4000

CMD ["node", "src/app.js"]