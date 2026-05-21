FROM node:18-alpine
WORKDIR /app
COPY backend/ .
RUN npm install
RUN npm run build
EXPOSE 3000
RUN groupadd -r app && useradd -r -g app app
USER app
CMD ["node", "index.js"]
