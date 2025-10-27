FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci --silent || npm i --silent

COPY . .

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173", "--strictPort"]
