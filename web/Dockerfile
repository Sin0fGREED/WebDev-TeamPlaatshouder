# --- Build ---
FROM node:24-alpine AS build
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
# If you build-time inject env vars, set them here as ARGs and use import.meta.env
RUN npm run build

# --- Serve ---
FROM nginx:1.27-alpine
COPY --from=build /usr/src/app/dist /usr/share/nginx/html
EXPOSE 80
