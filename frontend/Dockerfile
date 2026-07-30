# Use a lightweight Node runtime
FROM node:20-slim

# Set the working directory in the container
WORKDIR /app

# Copy package list files
COPY package*.json ./

# Install npm packages
RUN npm install

# Copy frontend source files
COPY . .

# Expose Vite server port
EXPOSE 5173

# Start Vite dev server with host mapping
CMD ["npm", "run", "dev"]
