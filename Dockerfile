FROM node:22-alpine AS node

# Run as non-root user
USER node
WORKDIR /usr/src/app

# Install npm dependencies first
# It will be cached if package.json is not changed
COPY package.json ./
RUN yarn install --production=true --pure-lockfile --frozen-lockfile --ignore-optional

# Copy the rest of the files
COPY . .

# Set file permissions
USER root
RUN chown --recursive node:node ./*
USER node

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["npm", "start"]
