  FROM node:18-alpine AS base
  WORKDIR /app
  # Add package manager files
  COPY package.json yarn.lock* package-lock.json* ./
  # Add Nx build files
  COPY nx.json tsconfig.base.json ./
  
  FROM base AS dependencies
  RUN npm ci
  COPY . .
  
  # ---- Build ----
  FROM dependencies AS build
  RUN npx nx build api --prod
  
  FROM node:18-alpine AS production
  WORKDIR /app
  # Copy node_modules and build output
  COPY --from=dependencies /app/node_modules ./node_modules
  COPY --from=build /app/dist/apps/api ./dist
  # Copy package.json for startup scripts
  COPY --from=dependencies /app/package.json ./
  
  EXPOSE 3000
  
  ENV NODE_ENV=production
  
  # Start the app
  CMD ["node", "dist/main.js"]