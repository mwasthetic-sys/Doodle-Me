# Build stage
FROM node:20-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM node:20-slim
WORKDIR /app
COPY package*.json ./
# Install production dependencies only
RUN npm install --omit=dev
# Install tsx to run the server
RUN npm install -g tsx
COPY --from=build /app/dist ./dist
COPY server.ts ./
# Copy types if needed by server.ts (though I put logic in server.ts)
# COPY src/types.ts ./src/types.ts 

ENV NODE_ENV=production
CMD ["npm", "start"]
