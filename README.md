# 摄影作品集网站

## 项目结构
```
photo-portfolio/
├── index.html   # 主页面
├── style.css    # 样式
├── app.js       # 交互逻辑
└── README.md    # 说明文档
```

## 功能列表
- ✅ 瀑布流照片墙
- ✅ 点赞功能（本地持久化）
- ✅ 收藏功能（本地持久化）
- ✅ 灯箱放大查看（键盘左右切换）
- ✅ 按分类筛选（风光/人像/街拍）
- ✅ 本地上传作品
- ✅ 暗色系专业摄影风格
- ✅ 移动端适配

## 部署到 GitHub Pages

```bash
# 1. 初始化 Git
git init
git add .
git commit -m "feat: 摄影作品集初始版本"

# 2. 推送到 GitHub
git remote add origin https://github.com/你的用户名/photo-portfolio.git
git push -u origin main

# 3. 在 GitHub 仓库设置中开启 Pages
# Settings → Pages → Source: Deploy from branch (main)
```

部署后访问地址：`https://你的用户名.github.io/photo-portfolio/`

## 下一步升级方向
- 接入 Supabase 实现多用户点赞同步
- 添加评论功能
- 添加 EXIF 信息展示（光圈/快门/ISO）
- 接入图床（cloudinary）实现持久上传
