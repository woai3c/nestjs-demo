FROM node:18-alpine

# work directory
WORKDIR /usr/src/app

RUN npm install -g pnpm

# copy package.json and pnpm-lock.yaml to work directory
COPY package*.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

# copy source code to work directory
COPY . .

RUN pnpm build

# expose port
EXPOSE 3000

# start
CMD ["pnpm", "start:prod"]