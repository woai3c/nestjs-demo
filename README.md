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
