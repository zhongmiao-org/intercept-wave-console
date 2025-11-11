# intercept-wave-console（前端测试控制台）

本文档描述前端测试控制台（intercept-wave-console）的目标、架构、打包与部署方式。本文不包含任何本地磁盘路径，适用于公开开源场景。

## 项目地址

- 项目主页（Console）：https://github.com/zhongmiao-org/intercept-wave-console
- 插件（JetBrains 平台）：https://github.com/zhongmiao-org/intercept-wave
- 插件（VS Code 平台）：https://github.com/zhongmiao-org/intercept-wave-vscode
- 上游测试服务 (Upstream)：https://github.com/zhongmiao-org/intercept-wave-upstream

## 相关组件

- 插件（代理中间件）：作为前后端连接的桥梁，转发请求并处理跨域，承接上游服务与前端交互。
- 上游服务（已发布到 GHCR）：提供 3 个 HTTP 服务与 3 个 WS 服务，供插件转发与集成测试。
- 前端测试控制台（本项目）：集成本地与集成测试的页面入口，仅访问插件暴露的接口与 WS，由插件完成跨域与转发。

## 项目定位与目标

- 定位：面向开发/测试的可视化控制台，聚焦“前端 → 插件 → 上游 → 插件 → 前端”的闭环验证。
- 目标：
  - 一次性接入插件提供的 3 个 HTTP 与 3 个 WS 能力。
  - 在本地和容器环境中快速拉起测试面板。
  - 打包为静态站点镜像并发布到 GHCR，便于 docker-compose 集成。

## 技术栈与基础约定

- 技术栈：Vue 3 + Vite + Naive UI + TypeScript（推荐）
- 状态管理：Pinia（可选）
- 构建产物：静态站点（dist），由 Nginx/Caddy 提供静态托管
- 访问路径：前端只访问“插件”的 HTTP/WS 暴露地址，不直接访问上游服务
- 跨域：由“插件”统一处理，前端无需额外反向代理或 CORS 配置

## 代码结构（分层）

- lib：独立工具与配置
  - `src/lib/config.ts` 读取 Vite 环境变量
  - `src/lib/net.ts` URL 拼接与 Query 工具
- services：基础服务能力封装
  - `src/services/http.ts` 包装 fetch，统一头、耗时、JSON 解析
  - `src/services/ws.ts` 包装 WebSocket，统一拼接 token/interval
- api：领域 API（以 upstream 文档为准）
  - `src/api/common.ts` health/status/delay/echo/rest 等
  - `src/api/user.ts` `/api/user/info`、`/api/posts`
  - `src/api/order.ts` `/order-api/orders`、`/order-api/order/{id}/submit`
  - `src/api/payment.ts` `/pay-api/checkout`
- types：领域类型
  - `src/types/upstream.ts` 常用响应类型定义
- stores（ViewModel）：
  - `src/stores/runtime.ts` 运行时配置、服务列表与日志
- components（View）：
  - 仅做交互与展示，调用 api/service，不承载业务逻辑

## 交互拓扑

- 访问链路：前端（浏览器） → 插件（转发+跨域） → 上游服务（HTTP/WS） → 插件 → 前端
- 对外端口（示例）：
  - 插件：`http://localhost:9000`（HTTP + WS 入口）
  - 前端：`http://localhost:8080`（Nginx 静态站点）
- 说明：具体端口以实际插件和部署为准，前端通过运行时配置读取 URL。

## 配置方式（统一使用 Vite .env）

不再使用运行时 `/config.json`。全部配置通过 Vite 的环境变量完成：

- `.env`：默认值（构建时生效）
- `.env.local`：本地开发覆盖（不提交版本库）

支持的变量（前缀改为 WAVE_）：

```
WAVE_PLUGIN_HTTP_1=http(s)://...
WAVE_PLUGIN_HTTP_2=http(s)://...
WAVE_PLUGIN_HTTP_3=http(s)://...
WAVE_PLUGIN_WS_1=ws(s)://...
WAVE_PLUGIN_WS_2=ws(s)://...
WAVE_PLUGIN_WS_3=ws(s)://...
WAVE_WS_TOKEN=zhongmiao-org-token
```

仓库内提供的示例 `.env`/`.env.local`（与本地开发配置一致）：

```
WAVE_PLUGIN_HTTP_1=http://localhost:8888/api
WAVE_PLUGIN_HTTP_2=http://localhost:8889/order-api
WAVE_PLUGIN_HTTP_3=http://localhost:8890/pay-api

WAVE_PLUGIN_WS_1=ws://localhost:8891
WAVE_PLUGIN_WS_2=ws://localhost:8892
WAVE_PLUGIN_WS_3=ws://localhost:8893

WAVE_WS_TOKEN=zhongmiao-org-token
```

页面初始化时读取 `import.meta.env.*`（见 `src/lib/config.ts`），并在 UI 中显示当前生效配置。

注意：Vite 的 `import.meta.env` 在“构建时”决定，运行时容器的环境变量不会影响已生成的静态文件。为支持“运行时注入”，本项目在容器启动时生成 `/usr/share/nginx/html/config.js`，页面优先读取 `window.__APP_CONFIG__`。

## Docker 打包与发布到 GHCR

- 项目镜像命名建议：`ghcr.io/<owner>/intercept-wave-console:<tag>`
- 多阶段 Dockerfile（Vite 构建 + Nginx 托管 + 运行时注入）：
```Dockerfile
# Dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY docker/default.conf /etc/nginx/conf.d/default.conf
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
EXPOSE 80
ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx","-g","daemon off;"]
```

方式1：构建时注入（可选）——通过 `--build-arg` 注入 Vite 环境变量（支持 `WAVE_` 前缀）：

```bash
docker build \
  --build-arg WAVE_PLUGIN_HTTP_1=http://plugin:9000 \
  --build-arg WAVE_PLUGIN_HTTP_2=http://plugin:9000 \
  --build-arg WAVE_PLUGIN_HTTP_3=http://plugin:9000 \
  --build-arg WAVE_PLUGIN_WS_1=ws://plugin:9000 \
  --build-arg WAVE_PLUGIN_WS_2=ws://plugin:9000 \
  --build-arg WAVE_PLUGIN_WS_3=ws://plugin:9000 \
  --build-arg WAVE_WS_TOKEN=zhongmiao-org-token \
  -t ghcr.io/<owner>/intercept-wave-console:<tag> .
```

也可在 Dockerfile 构建阶段复制特定环境的 `.env`（例如 `.env.prod`）覆盖默认 `.env`，效果等同于 `--build-arg`。

方式2：运行时注入（推荐）——通过 docker-compose/environment 设置变量，由入口脚本生成 config.js：

```yaml
ui:
  image: ghcr.io/<owner>/intercept-wave-console:<tag>
  ports:
    - "8080:80"   # 容器内监听 80，对外映射到 8080
  environment:
    - HTTP_1=http://plugin:9000
    - HTTP_2=http://plugin:9000
    - HTTP_3=http://plugin:9000
    - WS_1=ws://plugin:9000
    - WS_2=ws://plugin:9000
    - WS_3=ws://plugin:9000
    - WS_TOKEN=zhongmiao-org-token
  depends_on:
    - plugin
```

- 构建与推送（示例）：
```bash
OWNER=<your-gh-username-or-org>
TAG=<version-or-date>
IMAGE=ghcr.io/$OWNER/intercept-wave-console:$TAG

docker build -t $IMAGE .
echo $GHCR_TOKEN | docker login ghcr.io -u $OWNER --password-stdin

docker push $IMAGE
```

> 说明：`GHCR_TOKEN` 需具备 `write:packages` 权限，可用 GitHub PAT。

## docker-compose 集成（无反代，浏览器直连插件）

以下示例将上游、插件、前端置于同一网络。前端容器仅对外暴露 80 端口，用于访问页面。浏览器通过 `localhost:9000` 直连“插件”，由插件完成跨域处理与上游转发。

```yaml
# docker-compose.yml
services:
  upstream:
    image: ghcr.io/<owner>/intercept-wave-upstream:<tag>
    ports:
      - "9100:9100"
      - "9101:9101"
      - "9102:9102"

  plugin:
    image: ghcr.io/<owner>/intercept-wave:<tag>
    environment:
      - UPSTREAM_HTTP_1=http://upstream:9100
      - UPSTREAM_HTTP_2=http://upstream:9101
      - UPSTREAM_HTTP_3=http://upstream:9102
      - UPSTREAM_WS_1=ws://upstream:9100
      - UPSTREAM_WS_2=ws://upstream:9101
      - UPSTREAM_WS_3=ws://upstream:9102
      - CORS_ALLOW_ORIGINS=*
    ports:
      - "9000:9000"  # 插件对外 HTTP/WS 端口
    depends_on:
      - upstream

  ui:
    image: ghcr.io/<owner>/intercept-wave-console:<tag>
    ports:
      - "8080:80"
    depends_on:
      - plugin
    # 如需在容器构建时自定义 .env，可派生镜像或在构建阶段 COPY 自定义 .env
```

- 启动流程：
  - `docker compose up -d upstream plugin ui`
  - 打开 `http://localhost:8080`，前端优先使用运行时生成的 `config.js` 访问插件。
  - 路径与方法与上游文档保持一致（仅 host:port 指向插件）。
  - 确认插件已处理 HTTP 与 WS 的跨域（包含 101 升级场景）。

## 本地开发与调试

- 初始化：
  - `npm i` / `pnpm i` / `yarn`
- 开发：
  - 本地覆盖使用 `.env.local`（本仓库已提供示例值）。示例将 3 个 HTTP 与 3 个 WS 分别指向本机不同端口，并携带 HTTP 基础路径前缀：
    - HTTP：`http://localhost:8888/api`、`http://localhost:8889/order-api`、`http://localhost:8890/pay-api`
    - WS：`ws://localhost:8891`、`ws://localhost:8892`、`ws://localhost:8893`
  - `npm run dev` 启动 Vite，前端只读取 `import.meta.env.*`。
  - 在“HTTP/WS 测试”中，路径与上游文档一致（如 `/health`、`/ws/echo` 等）。

> 说明：正式部署推荐使用“运行时注入”，通过环境变量在容器启动时生成 `config.js`；`.env.local` 仅用于本地便捷覆盖，不应提交版本库。

## 命名与仓库

- 前端项目名称：`intercept-wave-console`（建议）
- 可选别名：`intercept-wave-dashboard` / `intercept-wave-lab`
- GHCR 仓库：`ghcr.io/<owner>/intercept-wave-console`

## 最小页面功能建议

- 服务面板：展示 3 个 HTTP 与 3 个 WS 的连接状态与延迟；
- HTTP 区域：可发起 GET/POST 测试请求，展示响应体与头；
  - 已内置与上游文档一致的常用路径预设（/health、/status/200、/rest/items 等）；
  - 支持自定义 Authorization、User-Agent、X-Request-Id 头与 credentials: include；
- WS 区域：连接/断开、发送/接收消息、心跳统计、重连策略；
  - 支持令牌 token（默认 zhongmiao-org-token）与 interval 参数，自动拼接到查询串；
- 日志与追踪：展示请求时间线与关键 header（用于排查代理行为）；
- 配置概览：实时显示当前生效的 Vite 环境变量。

## 常见问题（FAQ）

- 跨域相关：
  - 由插件负责统一 CORS 处理；若浏览器仍报错，检查插件的允许来源与 OPTIONS/101 升级头部。
- WebSocket 直连：
  - 确保插件对外端口支持 WS 升级（`Connection: upgrade` / `Upgrade: websocket`），并允许浏览器来源。
- 生产/测试切换：
  - 通过为不同环境准备不同的 `.env`，在构建阶段写入配置；`.env.local` 仅用于本地。
- 路径前缀不一致：
  - 本控制台不定义任何固定前缀；与上游文档保持一致即可（仅 host:port 指向插件）。
  - 在“HTTP/WS 测试”页追加路径时，既可写 `ping` 也可写 `/ping`，都会被规范化为正确的 URL。

## 快速开始（TL;DR）

1) 构建前端镜像并推送 GHCR：
```bash
docker build -t ghcr.io/<owner>/intercept-wave-console:<tag> .
echo $GHCR_TOKEN | docker login ghcr.io -u <owner> --password-stdin
docker push ghcr.io/<owner>/intercept-wave-console:<tag>
```

2) 使用 docker-compose 一键拉起：
```bash
docker compose up -d upstream plugin ui
open http://localhost:8080
```

3) 启动插件（若未随 compose 一起启动或需要先行拉起），确保其监听 9000 并已开启 CORS。

---

如需我基于此文档直接初始化 `intercept-wave-console` 的项目脚手架（Vite + Naive UI）与示例页面，并附带上述 Dockerfile/entrypoint/config 模版，请在 Issue 中提出或发起 PR。
