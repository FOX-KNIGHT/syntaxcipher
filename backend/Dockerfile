FROM node:alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Expose backend port
EXPOSE 4000

# Start server
CMD ["npm", "run", "dev"]
