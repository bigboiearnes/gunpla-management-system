# Stage 1: Build React App
FROM node:alpine AS client
WORKDIR /app/client
# Copy only package.json and package-lock.json initially
COPY client/package*.json ./
# Install dependencies
RUN npm install
# Copy the rest of the client application
COPY client .
# Build the React app
RUN npm run build

# Stage 2: Build Express Server
FROM node:alpine AS server
WORKDIR /app/server
# Copy only package.json and package-lock.json initially
COPY server/package*.json ./
# Install dependencies
RUN npm install
# Copy the rest of the server application
COPY server .
# (Optional) If your Express server requires compilation (TypeScript, etc.), build it here
# RUN npm run build

# Stage 3: Serve the Application
FROM nginx:alpine
# Copy built React app from the client stage
COPY --from=client /app/client/build /usr/share/nginx/html
# Copy built Express server from the server stage
COPY --from=server /app/server /usr/share/nginx/html/api
# Expose port 80
EXPOSE 80
# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
