#!/bin/bash

# AutoGLM AI 网站推送脚本
# 使用方法: ./push_to_github.sh YOUR_GITHUB_USERNAME

if [ $# -eq 0 ]; then
    echo "使用方法: $0 YOUR_GITHUB_USERNAME"
    echo "示例: $0 johndoe"
    exit 1
fi

GITHUB_USERNAME=$1
REPO_NAME="autoglm-ai-website"
GITHUB_URL="https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"

echo "🚀 开始推送AutoGLM AI网站到GitHub..."
echo "GitHub用户名: $GITHUB_USERNAME"
echo "仓库名称: $REPO_NAME"
echo "GitHub URL: $GITHUB_URL"
echo ""

# 检查Git状态
echo "📋 检查Git状态..."
git status
echo ""

# 检查是否有未提交的更改
if [[ -n $(git status --porcelain) ]]; then
    echo "⚠️  发现未提交的更改，正在提交..."
    git add .
    git commit -m "Final deployment commit: AutoGLM AI bilingual website with SEO optimization
    
🎯 Features:
- Complete bilingual support (EN/ZH) with language switcher
- Comprehensive SEO optimization (meta tags, canonical URLs, sitemap)
- Enhanced AutoGLM AI branding throughout the site
- Mobile-responsive design
- GitHub integration for CTA buttons
- Deployment-ready static website

🤖 Generated with Claude Code
https://claude.ai/code"
fi

echo "🔗 配置远程仓库..."
git remote remove origin 2>/dev/null
git remote add origin $GITHUB_URL

echo "📤 推送代码到GitHub..."
git push -u origin master --force

echo ""
echo "✅ 代码已成功推送到GitHub!"
echo "📍 仓库地址: $GITHUB_URL"
echo ""
echo "📋 下一步操作:"
echo "1. 访问您的GitHub仓库: $GITHUB_URL"
echo "2. 确保仓库设置为Public"
echo "3. 前往Vercel.com进行部署"
echo "4. 在Vercel中导入此GitHub仓库"
echo "5. 配置部署设置并点击Deploy"
echo ""
echo "📖 详细部署指南请参考: DEPLOYMENT_GUIDE.md"
echo ""
echo "🎉 祝您部署成功！"