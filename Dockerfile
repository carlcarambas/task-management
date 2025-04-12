FROM node:18-alpine

WORKDIR /app

# Install global dependencies
RUN npm install -g nx

# Copy package files
COPY package.json package-lock.json* ./

# Install project dependencies
RUN npm i
# RUN npm ci

# Copy the rest of the codebase
COPY . .

# Expose ports for development
EXPOSE 3333 4200

# Set up a script in package.json to run the command
CMD ["npm", "run", "start-all"]