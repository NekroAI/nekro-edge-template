# 🔧 故障排除指南

本指南收集了 NekroEdge 开发和部署过程中的常见问题及解决方案。

## 🚨 开发环境问题

### 启动失败

#### 问题：`pnpm dev` 启动失败

**错误信息**: `Module not found` 或 `Cannot resolve dependency`

**解决方案**:

```bash
# 1. 清理依赖缓存
rm -rf node_modules pnpm-lock.yaml
pnpm install

# 2. 检查 Node.js 版本
node --version  # 需要 >= 18

# 3. 检查 pnpm 版本
pnpm --version  # 需要 >= 8
```

#### 问题：端口冲突

**错误信息**: `Port 5173 is already in use`

**解决方案**:

```bash
# 方式一：修改 .env 文件
VITE_PORT=3000
VITE_API_PORT=8000

# 方式二：手动指定端口
pnpm dev --port 3000

# 方式三：查找并终止占用进程
lsof -ti:5173 | xargs kill -9
```

### 热重载问题

#### 问题：热重载不工作

**症状**: 修改代码后浏览器不自动更新

**解决方案**:

1. **确认访问地址**: 必须使用 `localhost:5173`，不是 `8787`
2. **检查 WebSocket 连接**: 在浏览器控制台查看是否有连接错误
3. **重启开发服务器**:
   ```bash
   # Ctrl+C 停止服务器
   pnpm dev  # 重新启动
   ```
4. **检查防火墙设置**: 确保 5173 端口未被阻止

### 数据库问题

#### 问题：数据库连接失败

**错误信息**: `D1_ERROR` 或 `Database not found`

**解决方案**:

```bash
# 1. 重新初始化本地数据库
rm -rf .wrangler/state
pnpm db:migrate

# 2. 检查数据库配置
cat wrangler.jsonc  # 确认配置正确

# 3. 手动创建迁移
pnpm db:generate
pnpm db:migrate
```

#### 问题：迁移文件冲突

**解决方案**:

```bash
# 1. 备份数据
cp .wrangler/state/v3/d1/miniflare-D1DatabaseObject/*.sqlite backup/

# 2. 重置迁移
rm -rf drizzle/*
pnpm db:generate

# 3. 重新应用迁移
pnpm db:migrate
```

## 🏗️ 构建问题

### Vite 构建错误

#### 问题：模块解析失败

**错误信息**: `Failed to resolve import` 或 `Cannot find module`

**解决方案**:

```typescript
// frontend/vite.config.mts
export default defineConfig({
  ssr: {
    noExternal: [
      "react-router-dom",
      "@mui/material",
      "@mui/system",
      "@mui/icons-material",
      "@emotion/react",
      "@emotion/styled",
      // 添加导致问题的模块
    ],
  },
});
```

#### 问题：TypeScript 类型错误

**解决方案**:

```bash
# 1. 运行类型检查
pnpm type-check

# 2. 检查 tsconfig.json 配置
# 3. 更新类型定义
pnpm add -D @types/node
```

### Wrangler 构建错误

#### 问题：esbuild 打包失败

**错误信息**: `Build failed` 或 `Transform failed`

**解决方案**:

```jsonc
// wrangler.jsonc
{
  "build": {
    "command": "pnpm build",
  },
  "compatibility_flags": ["nodejs_compat"],
  "node_compat": true,
}
```

## 🌐 部署问题

### Cloudflare Pages 部署失败

#### 问题：构建命令失败

**解决方案**:

1. **检查构建命令**: 确保在 Cloudflare Pages 设置中使用 `pnpm build`
2. **检查依赖安装**: 确保 `package.json` 中包含所有必要依赖
3. **检查 Node.js 版本**: 在 Pages 设置中指定 Node.js 18+

#### 问题：静态资源 404

**错误信息**: 静态文件无法访问

**解决方案**:

```jsonc
// wrangler.jsonc - 检查 assets 配置
{
  "env": {
    "production": {
      "assets": {
        "binding": "ASSETS",
        "directory": "./dist/client", // 确保路径正确
      },
    },
  },
}
```

### 数据库部署问题

#### 问题：生产数据库连接失败

**解决方案**:

```bash
# 1. 验证数据库配置
npx wrangler d1 list

# 2. 检查数据库 ID
npx wrangler d1 info your-db-name --env production

# 3. 重新应用迁移
pnpm db:migrate:prod

# 4. 测试数据库连接
npx wrangler d1 execute your-db-name --env production --command "SELECT 1"
```

## 🔍 调试技巧

### 开发环境调试

#### 查看详细日志

```bash
# Wrangler 详细日志
pnpm dev --verbose

# 查看构建过程
pnpm build --debug
```

#### 数据库调试

```bash
# 打开数据库管理界面
pnpm db:studio

# 查看数据库文件
ls -la .wrangler/state/v3/d1/

# 直接查询数据库
npx wrangler d1 execute your-db-name --local --command "SELECT * FROM posts"
```

### 生产环境调试

#### 实时日志监控

```bash
# 查看生产环境日志
npx wrangler tail --env production

# 查看特定时间段的日志
npx wrangler tail --env production --since 1h
```

#### 本地模拟生产环境

```bash
# 使用生产配置在本地运行
npx wrangler dev --env production --remote
```

## 🐛 常见错误码

### HTTP 错误

| 状态码 | 错误原因       | 解决方案                     |
| ------ | -------------- | ---------------------------- |
| 404    | 路由未找到     | 检查路由配置和 URL 路径      |
| 500    | 服务器内部错误 | 查看服务器日志，检查代码错误 |
| 502    | 网关错误       | 检查 Cloudflare 服务状态     |
| 524    | 超时错误       | 优化代码性能，增加超时设置   |

### 数据库错误

| 错误信息                   | 原因           | 解决方案                     |
| -------------------------- | -------------- | ---------------------------- |
| `D1_ERROR`                 | 数据库连接失败 | 检查数据库配置和网络连接     |
| `UNIQUE constraint failed` | 唯一约束冲突   | 检查数据唯一性，处理重复数据 |
| `no such table`            | 表不存在       | 运行数据库迁移               |

## 🔧 性能问题

### 页面加载缓慢

**诊断步骤**:

1. 使用浏览器开发者工具的 Network 面板分析
2. 检查是否有大量的 JavaScript 文件
3. 分析图片和其他资源的大小

**优化方案**:

```typescript
// 代码分割
const LazyComponent = React.lazy(() => import('./LazyComponent'));

// 图片优化
<img src="/image.webp" loading="lazy" alt="描述" />

// 资源预加载
<link rel="preload" href="/important.css" as="style" />
```

### API 响应缓慢

**诊断步骤**:

```bash
# 测试 API 响应时间
curl -w "@curl-format.txt" -o /dev/null http://localhost:8787/api/posts
```

**优化方案**:

```typescript
// 添加缓存
app.use("*", cache({ maxAge: 300 }));

// 数据库查询优化
const posts = await db
  .select({
    id: postsTable.id,
    title: postsTable.title,
    // 只选择需要的字段
  })
  .from(postsTable);
```

## 📱 移动端问题

### 响应式布局问题

**解决方案**:

```typescript
// 使用 Material-UI 的断点系统
<Box
  sx={{
    display: { xs: 'block', md: 'flex' },
    padding: { xs: 1, md: 2 },
  }}
>
  响应式内容
</Box>
```

### 触摸事件问题

**解决方案**:

```css
/* 改善移动端触摸体验 */
button {
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}
```

## 🆘 获取帮助

### 自助排查清单

1. ✅ 检查 Node.js 和 pnpm 版本
2. ✅ 确认所有依赖已正确安装
3. ✅ 查看浏览器控制台错误信息
4. ✅ 检查网络连接和防火墙设置
5. ✅ 查看项目文档和配置文件

### 报告问题

如果以上方法都无法解决问题，请：

1. **收集信息**:
   - 错误信息截图
   - 相关日志输出
   - 系统环境信息
   - 复现步骤

2. **提交 Issue**:
   - [GitHub Issues](https://github.com/KroMiose/nekro-edge-template/issues)
   - 提供详细的问题描述和环境信息

3. **社区讨论**:
   - [GitHub Discussions](https://github.com/KroMiose/nekro-edge-template/discussions)

## 💡 预防措施

### 定期维护

```bash
# 定期更新依赖
pnpm update

# 清理缓存
pnpm store prune

# 检查代码质量
pnpm type-check
pnpm format
```

### 备份策略

```bash
# 备份数据库
cp .wrangler/state/v3/d1/*.sqlite backup/

# 备份配置文件
cp wrangler.jsonc package.json backup/
```

记住：大多数问题都有解决方案，保持耐心并仔细查看错误信息！🐱
