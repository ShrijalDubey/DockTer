FROM node:18-alpine
WORKDIR /app
COPY backend/ .
RUN npm install
RUN npm run build
EXPOSE 3000
RUN addgroup -g 1001 nodeuser && adduser -u 1001 -G nodeuser -s /bin/sh -D nodeuser
USER nodeuser
CMD ["npm", "run", "start"]
