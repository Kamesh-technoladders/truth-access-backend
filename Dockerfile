# Use official Node.js LTS image
FROM node:18

# Create app directory
WORKDIR /app

# Copy package.json and package-lock.json (if exists)
COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Copy remaining app files
COPY . .

# Expose the port your server uses
EXPOSE 4001

# Set environment to production (optional)
ENV NODE_ENV=production
ENV PORT=4001

# Run your server with Node directly (not nodemon)
CMD [ "node", "server.js" ]
