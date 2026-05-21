FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD curl -f http://localhost:3000 || exit 1
USER node
CMD ["npm", "run", "preview"]