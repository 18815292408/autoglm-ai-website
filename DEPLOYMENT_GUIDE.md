# AutoGLM AI 网站部署指南

## 📋 部署前准备

### 1. GitHub仓库设置
1. 在GitHub上创建新仓库：
   - 仓库名建议: `autoglm-website` 或 `autoglm-ai-website`
   - 设置为Public（以便Vercel免费部署）
   - 不要初始化README、LICENSE等文件

### 2. 推送代码到GitHub

#### 方法一：使用Git命令行
```bash
# 添加远程仓库（替换YOUR_USERNAME为您的GitHub用户名）
git remote add origin https://github.com/YOUR_USERNAME/autoglm-website.git

# 推送代码到GitHub
git push -u origin master
```

#### 方法二：使用GitHub Desktop
1. 打开GitHub Desktop
2. 选择"Add Existing Repository"
3. 选择当前文件夹
4. 点击"Publish repository"
5. 设置仓库名称和可见性
6. 点击"Publish repository"

## 🚀 Vercel部署步骤

### 方法一：通过Vercel网站部署

1. **登录Vercel**
   - 访问 [vercel.com](https://vercel.com)
   - 使用GitHub账号登录

2. **导入项目**
   - 点击 "Add New..." → "Project"
   - 选择刚创建的GitHub仓库
   - 点击 "Import"

3. **配置部署设置**
   ```
   Framework Preset: Other
   Root Directory: ./
   Build Command: (留空，因为是静态网站)
   Output Directory: ./
   Install Command: (留空)
   ```

4. **环境变量**（可选）
   ```
   NODE_VERSION: 18
   ```

5. **部署**
   - 点击 "Deploy"
   - 等待部署完成

### 方法二：通过Vercel CLI部署

1. **安装Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **登录Vercel**
   ```bash
   vercel login
   ```

3. **部署项目**
   ```bash
   vercel --prod
   ```

## 🔧 部署配置文件

### vercel.json（可选）
```json
{
  "version": 2,
  "name": "autoglm-ai-website",
  "builds": [
    {
      "src": "**/*",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

## ✅ 部署后检查清单

1. **网站访问**
   - [ ] 主页正常加载
   - [ ] 所有CSS样式正确应用
   - [ ] JavaScript功能正常工作
   - [ ] 语言切换功能正常

2. **SEO检查**
   - [ ] 页面标题正确显示
   - [ ] Meta描述正确
   - [ ] robots.txt可访问
   - [ ] sitemap.xml可访问

3. **响应式设计**
   - [ ] 桌面版显示正常
   - [ ] 移动版显示正常
   - [ ] 平板版显示正常

4. **功能测试**
   - [ ] 导航链接正常工作
   - [ ] FAQ手风琴功能正常
   - [ ] 部署模弹窗正常
   - [ ] GitHub链接正确跳转

## 🌐 域名配置（可选）

### 使用Vercel提供的域名
- Vercel会自动分配 `your-project.vercel.app` 域名

### 使用自定义域名
1. 在Vercel项目设置中添加域名
2. 配置DNS记录
3. 等待SSL证书自动生成

## 🔄 自动部署设置

### GitHub Actions集成
Vercel会自动配置GitHub webhook，当您推送代码到GitHub时，会自动触发新的部署。

### 部署触发条件
- 推送到main/master分支
- 创建新的pull request
- 手动触发部署

## 📊 监控和分析

### Vercel Analytics
- 访问量统计
- 性能监控
- 错误追踪

### Google Search Console
1. 在Google Search Console中添加域名
2. 验证网站所有权
3. 提交sitemap
4. 监控搜索表现

## 🛠️ 故障排除

### 常见问题
1. **部署失败**
   - 检查文件路径
   - 验证vercel.json配置
   - 查看构建日志

2. **样式加载问题**
   - 检查CSS文件路径
   - 验证相对路径

3. **JavaScript错误**
   - 检查浏览器控制台
   - 验证ES6语法兼容性

### 联系支持
- Vercel支持: https://vercel.com/support
- GitHub支持: https://support.github.com

---

## 📝 部署完成后步骤

1. **设置环境变量**（如需要）
2. **配置自定义域名**（可选）
3. **设置CDN和缓存**
4. **配置分析和监控**
5. **定期更新和维护**

部署完成后，您的AutoGLM AI双语网站将在全球范围内可用！🎉