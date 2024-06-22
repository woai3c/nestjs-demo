- [v1-test](https://github.com/woai3c/nestjs-demo/tree/v1-test)
- [v2-rbac](https://github.com/woai3c/nestjs-demo/tree/v2-rbac)
- [v3-apidoc](https://github.com/woai3c/nestjs-demo/tree/v3-apidoc)
- [v4-i18n](https://github.com/woai3c/nestjs-demo/tree/v4-i18n)
- [v5-apm](https://github.com/woai3c/nestjs-demo/tree/v5-apm)

## Description

This is a NestJS project that uses the following technology stack:

- [NestJS](https://nestjs.com/): A framework for building efficient, scalable Node.js server-side applications.
- [TypeScript](https://www.typescriptlang.org/): A superset of JavaScript that adds static types and other features.
- [MongoDB](https://www.mongodb.com/): A NoSQL database used for data storage.
- [Jest](https://jestjs.io/): A testing framework for JavaScript and TypeScript.
- [Supertest](https://github.com/visionmedia/supertest): A library for testing HTTP servers.
- [ESLint](https://eslint.org/): A tool for checking the quality of JavaScript and TypeScript code.
- [Prettier](https://prettier.io/): A tool for automatically formatting JavaScript and TypeScript code.
- [Husky](https://typicode.github.io/husky/): A tool for managing git hooks, which can automatically run lint and tests before committing code.
- [cross-env](https://github.com/kentcdodds/cross-env): A library for setting environment variables, which can maintain consistent behavior across different operating systems.
- [redis](https://redis.io/): A in-memory data structure store, used as a cache.
- [swagger](https://swagger.io/): A tool for documenting APIs.
- [nestjs-i18n](https://nestjs-i18n.com/): A library for internationalization.

## Features

- user module - CRUD, RBAC
- auth module - login, register, delete, token and refresh token
- api doc - swagger
- i18n - internationalization

## Installation

```bash
# if you don't have pnpm installed, you can install it with npm
$ npm i -g pnpm
$ pnpm install
```

**Additionally, you need to have MongoDB installed in advance.**

## Running the app

```bash
# development
$ pnpm start

# watch mode
$ pnpm dev

# production mode
$ pnpm build
$ pnpm start:prod
```

## Test

```bash
# unit tests
$ pnpm test

# e2e tests
$ pnpm test:e2e

# test coverage
$ pnpm test:cov
```

## Docker Deployment

When deploying the project with Docker, you need to replace the environment variables in `docker-compose.yml`:

```yml
version: '3'
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - '3000:3000'
    depends_on:
      - mongodb
      - redis
    environment:
      - MONGODB_URL=mongodb://mongodb:27017/mongodb?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.2.0
      - NEST_SERVER_PORT=3000
      - NEST_CORS_DOMAINS=http://localhost:3001,http://localhost:8080
      - REDIS_URL=redis
      - REDIS_PORT=6379
    restart: always

  mongodb:
    image: mongo
    ports:
      - '27017:27017'
    volumes:
      - D:/software/mongodb/test:/data/db

  redis:
    image: redis:alpine
    ports:
      - '6379:6379'
    volumes:
      - D:/docker-data-map/redis/data:/data
```

Then, execute `docker-compose build` and `docker-compose up -d` to deploy the project.
