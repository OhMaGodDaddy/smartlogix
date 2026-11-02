FROM node:20-alpine

WORKDIR /app

# Copy configuration and backend source code
COPY config ./config
COPY src/backend ./src/backend

# Switch to backend directory and install production dependencies
WORKDIR /app/src/backend
RUN npm install --omit=dev

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["node", "server.js"]

