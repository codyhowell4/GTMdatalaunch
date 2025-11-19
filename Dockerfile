# Stage 1: Build the React Frontend
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Build Arguments
ARG GEMINI_API_KEY
ENV GEMINI_API_KEY=$GEMINI_API_KEY
ARG STRIPE_PAYMENT_LINK
ENV STRIPE_PAYMENT_LINK=$STRIPE_PAYMENT_LINK
RUN npm run build

# Stage 2: Production Server
FROM node:18-alpine
WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy built frontend assets from Stage 1
COPY --from=build /app/dist ./dist

# Copy backend source code
COPY server.js .
# Copy database schema if needed for migration scripts (optional)
COPY database_schema.sql .

# Expose the port the app runs on
ENV PORT=8080
EXPOSE 8080

# Start the server
CMD ["node", "server.js"]
