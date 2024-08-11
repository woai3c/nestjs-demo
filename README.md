- [v1-test](https://github.com/woai3c/nestjs-demo/tree/v1-test)
- [v2-rbac](https://github.com/woai3c/nestjs-demo/tree/v2-rbac)
- [v3-apidoc](https://github.com/woai3c/nestjs-demo/tree/v3-apidoc)
- [v4-i18n](https://github.com/woai3c/nestjs-demo/tree/v4-i18n)
- [v5-apm](https://github.com/woai3c/nestjs-demo/tree/v5-apm)
- [v6-global-exception](https://github.com/woai3c/nestjs-demo/tree/v6-global-exception)

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
- [cls-hooked](https://github.com/jeff-lewis/cls-hooked): A library for managing context in asynchronous operations.
- [elastic-apm-node](https://github.com/elastic/apm-agent-nodejs): APM for Node.js applications.
- [elashicrsearch](https://www.elastic.co/elasticsearch/): A distributed, RESTful search and analytics engine.
- [kibana](https://www.elastic.co/kibana): A tool for visualizing data in Elasticsearch.
- [prometheus](https://prometheus.io/): A monitoring and alerting toolkit.
- [grafana](https://grafana.com/): A tool for creating dashboards for monitoring data.

## Features

- user module - CRUD, RBAC
- auth module - login, register, delete, token and refresh token
- api doc - swagger
- i18n - internationalization
- APM - Elastic APM

## Installation

```bash
# if you don't have pnpm installed, you can install it with npm
npm i -g pnpm
pnpm install
```

**Additionally, you must install MongoDB and Redis in advance.**

## Running the app

```bash
# development
pnpm start

# watch mode
pnpm dev

# production mode
pnpm build
pnpm start:prod
```

## Test

```bash
# unit tests
pnpm test

# e2e tests
pnpm test:e2e

# test coverage
pnpm test:cov
pnpm test:e2e-cov
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
      - apm-server
      - prometheus
      - node-exporter
      - grafana
    environment:
      - MONGODB_URL=mongodb://mongodb:27017/mongodb?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.2.0
      - NEST_SERVER_PORT=3000
      - NEST_CORS_DOMAINS=http://localhost:3001,http://localhost:8080
      - REDIS_URL=redis
      - REDIS_PORT=6379
      - ELASTIC_APM_SERVICE_NAME=nestjs-app
      - ELASTIC_APM_SERVER_URL=http://apm-server:8200
      - ELASTIC_APM_SECRET_TOKEN=
      - ELASTIC_SEARCH_URL=http://elasticsearch:9200
      - ELASTIC_SEARCH_NAME=elastic
      - ELASTIC_SEARCH_PASSWORD=yourpassword

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

  apm-server:
    image: docker.elastic.co/apm/apm-server:7.10.1
    ports:
      - '8200:8200'
    environment:
      - output.elasticsearch.hosts=["http://elasticsearch:9200"]
      - setup.kibana.host=http://kibana:5601
      - apm-server.secret_token=
    depends_on:
      - elasticsearch

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.10.1
    environment:
      - discovery.type=single-node
      - ELASTIC_PASSWORD=yourpassword # elastic password
    ports:
      - '9200:9200'
    volumes:
      - D:/docker-data-map/elasticsearch/data:/usr/share/elasticsearch/data

  kibana:
    image: docker.elastic.co/kibana/kibana:7.10.1
    ports:
      - '5601:5601'
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    depends_on:
      - elasticsearch

  prometheus:
    image: prom/prometheus
    ports:
      - '9090:9090'
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'

  node-exporter:
    image: prom/node-exporter
    ports:
      - '9100:9100'

  grafana:
    image: grafana/grafana
    ports:
      - '3001:3000'
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=yourpassword
    volumes:
      - D:/docker-data-map/grafana-data:/var/lib/grafana

volumes:
  grafana-data:
```

Then, execute `docker-compose build` and `docker-compose up -d` to deploy the project.

## Differences Between APM and Prometheus

### APM (Application Performance Monitoring)

- **Purpose**: Primarily used for monitoring the performance and health of applications. It can capture detailed information such as errors, latency, transactions, and requests within the application.
- **Users**: Developers, Operations personnel
- **Data Types**: Transactions, errors, requests, response times, database queries, etc.
- **Tools**: Elastic APM, New Relic, Datadog APM, etc.
- **Advantages**:
  - Provides detailed application-level performance data.
  - Helps identify and resolve performance bottlenecks and errors within the application.
  - Highly integrated, often used in conjunction with log management and error tracking tools.

### Prometheus

- **Purpose**: Primarily used for monitoring systems and services. It collects and stores time-series data and provides a powerful query language (PromQL) to analyze this data.
- **Users**: Operations personnel
- **Data Types**: System metrics (CPU, memory, disk, network, etc.), service metrics, custom application metrics, etc.
- **Tools**: Prometheus, Alertmanager, Grafana (for visualization), etc.
- **Advantages**:
  - Powerful time-series database and query language.
  - Suitable for monitoring the health of infrastructure and services.
  - Supports alerting and notification features, helping to detect and resolve issues promptly.

### Summary

- **APM** focuses more on application-level performance monitoring and error capturing, suitable for developers and operations personnel.
- **Prometheus** focuses more on system and service-level monitoring, suitable for operations personnel, providing powerful time-series data storage and querying capabilities.

Both can be used together, with APM handling application performance monitoring and Prometheus handling system and service monitoring, providing a comprehensive monitoring solution. However, there is currently an issue where APM can only view collected CPU and memory data, and other logs cannot be viewed. This will be resolved later when time permits.

## Configuring Kibana

### Steps to Create a Kibana Index Pattern

1. Open Kibana.
2. Navigate to "Stack Management".
3. Select "Index Patterns".
4. Click "Create index pattern".
5. Enter `apm-*` as the index pattern.
6. Select the time field (usually `@timestamp`).
7. Click "Create index pattern".

### Viewing Data

1. Visit `localhost:5601`, click the `three lines` icon in the top left, and select Discover to view log information.
2. Visit `localhost:5601`, click the `three lines` icon in the top left, and select APM -> Select your service to view monitoring data.

### Steps to Create a Kibana Dashboard

1. Create a Dashboard:

   - In the main Kibana interface, click "Dashboard".
   - Click "Create new dashboard".

2. Add Visualizations:

   - Click the "Add" button, select "Create new visualization".
   - Choose the type of visualization you want (e.g., line chart, bar chart, etc.).
   - Configure the data source and display options, selecting the metrics you need.

3. Save and View:
   - Save your dashboard and view it as needed.

## Configuring Grafana

1. Visit `http://localhost:3001` and log in to Grafana with the username `admin` and the password you set in `docker-compose.yml` for `GF_SECURITY_ADMIN_PASSWORD`. If not set, the default password is `admin`.
2. From the left menu, select Connections -> Data Sources -> Add data source -> Prometheus -> Enter `http://prometheus:9090` (based on your Docker Compose configuration) -> Save & Test.
3. From the left menu, select Connections -> Data Sources -> Add data source -> Elasticsearch -> Enter `http://elasticsearch:9200` (based on your Docker Compose configuration) -> In the Elasticsearch details section, set the following:
   - Index name: `apm-*` (based on your APM configuration)
   - Time field name: `@timestamp` -> Save & Test.
4. From the left menu, select Dashboard -> Create dashboard -> Add Visualization -> Select Prometheus -> Add query statements to monitor data -> Save dashboard.
5. From the left menu, select Dashboard -> Create dashboard -> Add Visualization -> Select Elasticsearch -> Add query statements to monitor data -> Save dashboard.

```sh
# Prometheus Query Statements
# CPU Usage
avg((node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes) * 100
# Memory Usage
100 - (avg(irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)
# Disk Usage
100 - (node_filesystem_free_bytes{fstype!="tmpfs", fstype!="overlay"} / node_filesystem_size_bytes{fstype!="tmpfs", fstype!="overlay"} * 100)
# Network Traffic
100 - (node_filesystem_free_bytes{fstype!="tmpfs", fstype!="overlay"} / node_filesystem_size_bytes{fstype!="tmpfs", fstype!="overlay"} * 100)
```
