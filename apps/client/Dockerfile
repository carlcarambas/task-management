# ---- Base Node ----
  FROM node:18-alpine AS base
  WORKDIR /app
  COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
  COPY nx.json tsconfig.base.json ./
  
  FROM base AS dependencies
  RUN npm ci
  COPY . .
  
  # ---- Build ----
  FROM dependencies AS build
  RUN npx nx build web --prod
  
  # ---- Production with Nginx ----
  FROM nginx:alpine AS production
  # Copy built assets from build stage
  COPY --from=build /app/dist/apps/web /usr/share/nginx/html
  COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
  
  # Expose port
  EXPOSE 80
  
  # Start nginx
  CMD ["nginx", "-g", "daemon off;"]