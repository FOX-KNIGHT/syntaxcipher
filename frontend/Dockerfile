FROM node:alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Expose Vite's default dev port
EXPOSE 5173

# Start the dev server and bind to all network interfaces
CMD ["npm", "run", "dev", "--", "--host"]
