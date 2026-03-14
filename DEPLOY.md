# 待办管理系统 - 跨设备部署指南

## 目录
- [方案一：GitHub Pages（推荐）](#方案一github-pages推荐)
- [方案二：Vercel](#方案二vercel)
- [方案三：Netlify](#方案三netlify)
- [方案四：局域网访问](#方案四局域网访问)
- [方案五：云服务器部署](#方案五云服务器部署)

---

## 方案一：GitHub Pages（推荐）

### 优点
- ✅ 免费
- ✅ 自动HTTPS
- ✅ 自定义域名支持
- ✅ 简单易用

### 步骤

#### 1. 创建GitHub仓库
```bash
# 在项目目录初始化git
git init

# 添加所有文件
git add .

# 提交
git commit -m "初始化待办管理系统"

# 创建GitHub仓库后，添加远程仓库
git remote add origin https://github.com/你的用户名/zytodo.git

# 推送到GitHub
git push -u origin main
```

#### 2. 启用GitHub Pages
1. 打开GitHub仓库页面
2. 点击"Settings"
3. 左侧菜单找到"Pages"
4. Source选择"Deploy from a branch"
5. Branch选择"main"，目录选择"/ (root)"
6. 点击"Save"

#### 3. 访问网站
- 等待几分钟后，访问：`https://你的用户名.github.io/zytodo/`
- 所有设备都可以通过这个地址访问

---

## 方案二：Vercel

### 优点
- ✅ 免费
- ✅ 自动HTTPS
- ✅ 全球CDN加速
- ✅ 自动部署

### 步骤

#### 1. 安装Vercel CLI
```bash
npm install -g vercel
```

#### 2. 部署
```bash
# 在项目目录执行
vercel

# 按照提示操作
# 第一次会要求登录
# 然后选择部署配置
```

#### 3. 访问网站
- 部署完成后，Vercel会提供一个URL：`https://你的项目名.vercel.app`
- 所有设备都可以通过这个地址访问

---

## 方案三：Netlify

### 优点
- ✅ 免费
- ✅ 自动HTTPS
- ✅ 拖拽部署
- ✅ 表单处理

### 步骤

#### 方法1：拖拽部署
1. 访问 [Netlify](https://www.netlify.com/)
2. 注册并登录
3. 将项目文件夹直接拖到页面上
4. 等待部署完成

#### 方法2：Git部署
1. 在Netlify中连接GitHub仓库
2. 选择你的仓库
3. 配置构建设置（静态网站无需构建）
4. 点击"Deploy"

#### 4. 访问网站
- 部署完成后，Netlify会提供一个URL：`https://你的项目名.netlify.app`

---

## 方案四：局域网访问

### 适用场景
- 家庭或办公室内部使用
- 不需要公网访问

### 步骤

#### 1. 查看本机IP地址

**Windows:**
```bash
ipconfig
```

**Mac/Linux:**
```bash
ifconfig
# 或
ip addr show
```

找到本机的局域网IP地址，通常是：
- `192.168.x.x`
- `10.0.x.x`
- `172.16.x.x`

#### 2. 启动服务器
```bash
# 使用Python启动HTTP服务器
python3 -m http.server 8080 --bind 0.0.0.0

# 或使用Node.js的http-server
npx http-server -p 8080 -a 0.0.0.0
```

#### 3. 防火墙设置

**Windows:**
- 控制面板 → Windows Defender 防火墙 → 高级设置
- 入站规则 → 新建规则 → 端口 → TCP 8080 → 允许连接

**Mac:**
- 系统偏好设置 → 安全性与隐私 → 防火墙 → 防火墙选项
- 允许Python或Node.js接受传入连接

#### 4. 其他设备访问
- 同一局域网内的其他设备访问：`http://你的IP地址:8080`
- 例如：`http://192.168.1.100:8080`

---

## 方案五：云服务器部署

### 适用场景
- 需要完全控制
- 需要自定义域名
- 需要更高的性能

### 步骤

#### 1. 购买云服务器
- 阿里云ECS
- 腾讯云CVM
- AWS EC2

#### 2. 安装Web服务器
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# CentOS/RHEL
sudo yum install nginx
```

#### 3. 上传文件
```bash
# 使用scp上传
scp -r /Users/zhangyu/Documents/trae_projects/zytodo/* root@你的服务器IP:/var/www/html/

# 或使用FTP工具（FileZilla等）
```

#### 4. 配置Nginx
```nginx
# /etc/nginx/sites-available/default
server {
    listen 80;
    server_name 你的域名或IP;
    
    root /var/www/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ =404;
    }
}
```

#### 5. 启动Nginx
```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

#### 6. 配置HTTPS（可选）
```bash
# 安装Certbot
sudo apt install certbot python3-certbot-nginx

# 获取SSL证书
sudo certbot --nginx -d 你的域名

# 自动续期
sudo certbot renew --dry-run
```

---

## 推荐方案对比

| 方案 | 费用 | 难度 | 速度 | 适用场景 |
|------|------|------|------|----------|
| GitHub Pages | 免费 | ⭐ | 快 | 个人项目、开源项目 |
| Vercel | 免费 | ⭐ | 很快 | 现代Web应用 |
| Netlify | 免费 | ⭐ | 快 | 静态网站 |
| 局域网访问 | 免费 | ⭐⭐ | 最快 | 内部使用 |
| 云服务器 | 付费 | ⭐⭐⭐ | 快 | 企业级应用 |

---

## 常见问题

### 1. 跨域问题
如果遇到跨域问题，在Bmob控制台配置域名白名单：
- 应用设置 → 安全验证 → Web安全域名
- 添加你的域名

### 2. 数据同步
- 所有设备访问同一个Bmob应用
- 数据自动同步到云端
- 刷新页面即可看到最新数据

### 3. 离线访问
- 现代浏览器会缓存静态资源
- 可以添加Service Worker实现离线访问

---

## 下一步

选择一个适合你的方案，按照步骤操作即可实现跨设备访问！

推荐使用 **GitHub Pages** 或 **Vercel**，简单免费且稳定。
