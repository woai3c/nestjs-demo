## APM 和 Prometheus 的区别

### APM (Application Performance Monitoring)

- **用途**: 主要用于监控应用程序的性能和健康状况。它可以捕获应用程序中的错误、延迟、事务、请求等详细信息。
- **用户**: 开发者、运维人员
- **数据类型**: 事务、错误、请求、响应时间、数据库查询等。
- **工具**: Elastic APM、New Relic、Datadog APM 等。
- **优点**:
  - 提供详细的应用程序级别的性能数据。
  - 帮助识别和解决应用程序中的性能瓶颈和错误。
  - 集成度高，通常与日志管理和错误跟踪工具结合使用。

### Prometheus

- **用途**: 主要用于系统和服务的监控。它收集和存储时间序列数据，并提供强大的查询语言（PromQL）来分析这些数据。
- **用户**: 运维人员
- **数据类型**: 系统指标（CPU、内存、磁盘、网络等）、服务指标、自定义应用程序指标等。
- **工具**: Prometheus、Alertmanager、Grafana（用于可视化）等。
- **优点**:
  - 强大的时间序列数据库和查询语言。
  - 适用于监控基础设施和服务的健康状况。
  - 支持告警和通知功能，帮助及时发现和解决问题。

### 总结

- **APM** 更加专注于应用程序级别的性能监控和错误捕获，适用于开发者和运维人员。
- **Prometheus** 更加专注于系统和服务级别的监控，适用于运维人员，提供强大的时间序列数据存储和查询功能。

两者可以结合使用，APM 负责应用程序的性能监控，Prometheus 负责系统和服务的监控，共同提供全面的监控解决方案。但是目前有个问题 APM 只能查看收集到的 CPU 和内存数据，其他的日志都无法查看，后续有时间再解决。

## Kibana

### 创建Kibana索引模式的步骤

1. 打开Kibana。
2. 导航到“Stack Management”。
3. 选择“Index Patterns”。
4. 点击“Create index pattern”。
5. 输入 apm-\* 作为索引模式。
6. 选择时间字段（通常是 @timestamp）。
7. 点击“Create index pattern”。

### 查看数据

1. 访问 localhost:5601 点击左上角的 `三` 图标，选择 Discover 可以查看日志信息。
2. 访问 localhost:5601 点击左上角的 `三` 图标，选择 APM -> 选择自己的服务查看监控数据。

### 创建Kibana仪表板的步骤

1. 创建仪表板：

- 在Kibana的主界面，点击“Dashboard”。
- 点击“Create new dashboard”。

2. 添加可视化：

- 点击“Add”按钮，选择“Create new visualization”。
- 选择你想要的可视化类型（如折线图、柱状图等）。
- 配置数据源和显示选项，选择你需要的指标。

3. 保存和查看：

- 保存你的仪表板，并在需要时查看。

## Grafana

1. http://localhost:3001 登录 grafana，账号是 admin，密码是你在 `docker-compose.yml` 中设置的 `GF_SECURITY_ADMIN_PASSWORD` 的值。没设置就是初始密码 admin。
2. 左侧菜单选择 Connections -> Data Sources -> Add data source -> Prometheus -> URL 填写 `http://prometheus:9090`（根据你的 Docker Compose 配置） -> Save & Test。
3. 左侧菜单选择 Connections -> Data Sources -> Add data source -> Elasticsearch -> URL 填写 `http://elasticsearch:9200`（根据你的 Docker Compose 配置） -> 在 Elasticsearch details 部分，设置以下内容：
   Index name: apm-\*（根据你的 APM 配置）
   Time field name: @timestamp -> Save & Test。
4. 左侧菜单选择 Dashboard -> Create dashboard -> Add Visualization -> Selete Prometheus -> 添加查询语句来监控数据 -> Save dashboard。
5. 左侧菜单选择 Dashboard -> Create dashboard -> Add Visualization -> Selete Elasticsearch -> 添加查询语句来监控数据 -> Save dashboard。

```sh
# Prometheus 查询语句
# cpu 使用率
avg((node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes) * 100
# 内存使用率
100 - (avg(irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)
# 磁盘使用率
100 - (node_filesystem_free_bytes{fstype!="tmpfs", fstype!="overlay"} / node_filesystem_size_bytes{fstype!="tmpfs", fstype!="overlay"} * 100)
# 网络流量
100 - (node_filesystem_free_bytes{fstype!="tmpfs", fstype!="overlay"} / node_filesystem_size_bytes{fstype!="tmpfs", fstype!="overlay"} * 100)
```
