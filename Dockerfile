# Use Node.js 20
FROM node:20

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and install deps
COPY package*.json ./
RUN npm install

# Copy rest of code
COPY . .

# Build TypeScript
RUN npm run build

# Expose Render dynamic port
EXPOSE 10000

# Start app
CMD ["npm", "start"]
