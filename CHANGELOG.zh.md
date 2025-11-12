# Intercept Wave 前端测试控制台更新日志

> [English Changelog](./CHANGELOG.md) | 中文更新日志

## [未发布]

### 新增
- HTTP/WS「路径追加（可选）」改为下拉选择（`n-select`），支持过滤、清除与自由输入（tag 模式）。
- WS 新增「额外查询参数」编辑器（`NDynamicInput`，pair 预设），可添加多组 key/value，统一以字符串拼接到 URL 查询串。
- WS 预设下拉补充路径：`/ws/food/user`、`/ws/food/merchant`。
- 选择 `/ws/ticker` 时，自动填入 `interval=1000` 的默认值（可手动修改）。

### 变更
- HTTP 路径下拉的选项由「预设」列表自动生成并去重，保持与上游文档一致。
- WS 间隔输入框的占位提示明确 `/ws/ticker` 需要该参数。

### 移除
- 从 WS 路径下拉中移除不存在的 `/socket` 选项。

## [v0.1.3] - 2025-11-08

- 初始化 CI：PR lint 与构建
- 合并到 main 自动草拟 Release
- 发布工作流：构建镜像并上传 GHCR
- 项目脚手架（Vite + Vue 3 + TS）
- 使用 Nginx 静态托管的 Docker 镜像
- 运行时配置注入 `config.js`
