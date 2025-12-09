#!/bin/bash

# AutoGLM AI 网站GitHub CLI部署脚本
# 使用方法: ./deploy_setup.sh YOUR_GITHUB_USERNAME

set -e

if [ $# -eq 0 ]; then
    echo "❌ 错误: 请提供GitHub用户名"
    echo ""
    echo "使用方法: $0 YOUR_GITHUB_USERNAME"
    echo "示例: $0 johndoe"
    echo ""
    exit 1
fi

GITHUB_USERNAME=$1
REPO_NAME="autoglm-ai-website"
GITHUB_URL="https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"

echo "🚀 AutoGLM AI 网站GitHub部署设置"
echo "=================================="
echo "👤 GitHub用户名: $GITHUB_USERNAME"
echo "📦 仓库名称: $REPO_NAME"
echo "🔗 GitHub URL: $GITHUB_URL"
echo ""

# 检查Git状态
echo "📋 检查Git状态..."
if [[ -n $(git status --porcelain) ]]; then
    echo "发现未提交的更改，正在提交..."
    
    # 添加所有新文件
    echo "📁 添加新文件..."
    git add .
    
    # 提交更改
    echo "💾 提交更改..."
    git commit -m "🚀 AutoGLM AI 网站部署准备

✨ 新增功能:
- GitHub Actions自动部署配置
- Vercel部署优化设置
- 完整的SEO优化文件
- 双语言支持和品牌优化
- 移动端响应式设计

🔧 技术栈:
- 纯静态HTML/CSS/JavaScript
- Vercel部署平台
- GitHub Actions CI/CD
- 完整SEO优化

🌟 特色:
- AutoGLM AI品牌强化
- 中英双语支持
- 完整部署教程
- GitHub集成

🤖 Generated with Claude Code
🔗 https://claude.ai/code"
else
    echo "✅ 所有更改已提交"
fi

echo ""

# 检查是否有GitHub CLI
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) 未安装"
    echo ""
    echo "请先安装GitHub CLI:"
    echo "macOS: brew install gh"
    echo "Windows: winget install GitHub.cli"
    echo "Ubuntu: sudo apt install gh"
    echo ""
    echo "然后运行: gh auth login"
    exit 1
fi

# 检查是否已登录GitHub
if ! gh auth status &> /dev/null; then
    echo "❌ 您未登录GitHub"
    echo ""
    echo "请运行: gh auth login"
    exit 1
fi

echo "✅ GitHub CLI 已就绪"

# 创建GitHub仓库
echo ""
echo "🏗️  创建GitHub仓库..."
if gh repo view $GITHUB_USERNAME/$REPO_NAME &> /dev/null; then
    echo "✅ 仓库已存在: $GITHUB_URL"
else
    echo "📦 创建新仓库..."
    gh repo create $GITHUB_USERNAME/$REPO_NAME \
        --public \
        --description="AutoGLM AI - 开源本地化AI智能体框架，自主部署手机AI自动化平台" \
        --homepage="https://autoglm.com" \
        --gitignore="Node,Windows,macOS,Linux" \
        --license="MIT"
    echo "✅ 仓库创建成功"
fi

# 配置远程仓库
echo ""
echo "🔗 配置远程仓库..."
git remote remove origin 2>/dev/null || true
git remote add origin $GITHUB_URL

# 推送到GitHub
echo ""
echo "📤 推送代码到GitHub..."
git push -u origin master --force

echo ""
echo "🎉 代码已成功推送到GitHub!"
echo "=================================="
echo ""
echo "📍 仓库地址: $GITHUB_URL"
echo "🌐 网址: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
echo ""
echo "📋 下一步 - Vercel部署:"
echo "1️⃣  访问 Vercel.com 并用GitHub账号登录"
echo "2️⃣  点击 'Add New' → 'Project'"
echo "3️⃣  选择 '$REPO_NAME' 仓库"
echo "4️⃣  配置部署设置:"
echo "   • Framework Preset: Other"
echo "   • Root Directory: ./"
echo "   • Build Command: (留空)"
echo "   • Output Directory: ./"
echo "5️⃣  在环境变量中添加:"
echo "   • VERCEL_TOKEN: 您的Vercel API Token"
echo "6️⃣  点击 'Deploy Project'"
echo ""
echo "🔧 GitHub Actions设置:"
echo "1️⃣  在GitHub仓库设置中添加Secret:"
echo "   • 名称: VERCEL_TOKEN"
echo "   • 值: 您的Vercel API Token"
echo ""
echo "📖 获取Vercel Token:"
echo "1️⃣  登录 Vercel Dashboard"
echo "2️⃣  进入 Settings → Tokens"
echo "3️⃣  创建新的Token"
echo ""
echo "🚀 自动部署已配置! 推送到master分支会自动触发部署"
echo ""
echo "🎯 部署完成后，您的网站将在以下地址可用:"
echo "• Vercel域名: https://$REPO_NAME-$GITHUB_USERNAME.vercel.app"
echo "• 或自定义域名"
echo ""
echo "✨ 祝您部署成功! ✨"