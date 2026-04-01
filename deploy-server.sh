#!/bin/bash
# ============================================
# 员工打卡系统 - 云服务器一键部署脚本
# ============================================

SERVER_IP="47.237.252.200"
SERVER_USER="root"
KEY_FILE="/tmp/oracle_key.pem"

echo "============================================"
echo "员工打卡系统 - 云服务器部署"
echo "服务器: $SERVER_IP"
echo "============================================"
echo ""

# 第1步：保存SSH密钥
echo ">>> 第1步：保存SSH密钥..."
cat > $KEY_FILE << 'KEYEOF'
-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAuu82JM3EUtmk8Q6f0gyjnL6mrmtxzT/nMwixgyPwdM6JBv3Y
VSD1dlBd1MDSwVe7p4x1sY7s/GP5WZHr7xtw/VCmxR4L7JA7lnc8u86P5lmsCEYA
20uswhFB3ZwVp3lQIWTkekqmPJBXTRSG6GmITBnHV0nzUoV81qQM6ys03Q+lPLzK
J032UMuam6Oet5cGb/a8Nsbo4uYbhut5yeJutN3ZW7h9Wu1BudNhhYhi4UPB203L
lncNTw0Ieu//3RFFKw6GbIFjkcG9c1BtLzxlJjZ8C0lilQRIs2z/RNzaOWwgitCa
pZqfndGtVyW48K9+jE0uvKCl8P9qzqjOEaIwPwIDAQABAoIBAAe9pR5+s30CIeLm
NKG0P/LbMDgedI7Hxnv7WwJvsrgw30VorenPMhWX/AgLLg8EjN2XeD4wiXQQHcC4
RVlYPQ8NpReaMsCKiR/QyIqMYggWDtokL/U6G9QeISibRd2dV+nyGBtPoQpL/dl6
xUq1fV04Cg79cx59Lu9idAh++F2ZA0xUYLkRZ4FBCaaF2nNrh/VpdK3x60JVXumT
T2Mz4GJybrX/gpyyHStfhcH91A01nv1ZoUIn2RydRyd/KXRFtRyBaWG0Zey7/q/B
MRy0HK9DWSQaxf+PKC345VPFH9svlmJTkkYryp+78dTlUzLR5A15pz0JUKNzJM3p
Bp9z7uECgYEA09Ar4nZCqkfW7GrXra7AsILRDckX5Gcsi4F4lMHJ9s0guIMrQu3N
Le/Zn8AfLXKdxxUQGcYZNDsGJGtIZITl3mf0ZrZuyHk6hoMKYXYaNaFImmXZd5Qm
70b82XS9nJ64RO6zEPrjUeJoVJDwug6dNwVa7QH7eyfI7zRLOufphiECgYEA4e5l
kgsufdO7qoGHQUTljNkwPOTkyG7mNJJsBxWHVMSF8fg97qSWLWa0fVELgIQ75pcU
ZgnuIlyUCFpV34ldKBMPwg98/+Rq6Cn4A8ca2qH26jQTEgJwG0tKBnarO3/u9zW9
Cvj1NFa4zJTLQcAejfVPe7meQ7IrV+zDr4L4Kl8CgYBWj8mPeCMQceF8psFTwooO
2LdUuezgs+V5ccT0jinaicQog7qHVKW4cz/t0FctfJzMQmhdEB82wDRnZ8yi/8jt
VnCEFWQ624g2dpEkeV6Gsk34g00XWF19BfbJa7MdsaO+0AowE0gZK7zVapJmhxhq
5u5c06WRlBXC5A0mmqZN4QKBgChKIhTMJ6tKodHDLYKHLcRTStXhH6dal3TSk68j
uLF2JkjDMxAmi51nDlK2rC1r5160nG+h37SC++cNbPji/xjRZWL+7hSYADSMn2zV
CcXpUiXryWbRxnonj/jdGqYOp2ewTpjxUpDV0jixZBnCj/BSyazPqhh6Yl5Ym4Dm
AylTAoGBAIny8glT/ET4jzuGZNsVdQx3YLEzjKCR4RI7Rrr2BU2SbJVXUqYv/Yxn
kZ0eB1e2sFUM8q6yjAeN7i1TKKtqTwG+AOk9CrIdoiZlKt/g/KUt3/WKuY5AVNvN
T99XFekOBN9e4XgvfkgQrav/U1rujgtTW10yHsk5hNDNTvyOAtL5
-----END RSA PRIVATE KEY-----
KEYEOF
chmod 600 $KEY_FILE
echo "✅ SSH密钥已保存"

# 第2步：测试连接
echo ""
echo ">>> 第2步：测试SSH连接..."
ssh -i $KEY_FILE -o StrictHostKeyChecking=no -o ConnectTimeout=10 $SERVER_USER@$SERVER_IP "echo '✅ SSH连接成功！' && cat /etc/os-release | head -2"
if [ $? -ne 0 ]; then
    echo "❌ SSH连接失败！请检查IP和密钥是否正确"
    exit 1
fi

# 第3步：在服务器上安装依赖
echo ""
echo ">>> 第3步：安装系统依赖（Node.js, Nginx, PM2）..."
ssh -i $KEY_FILE -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP << 'REMOTE'
set -e

# 更新系统
echo "--- 更新系统包管理器 ---"
apt-get update -y || yum update -y

# 安装 curl 和 git
echo "--- 安装 curl 和 git ---"
apt-get install -y curl git nginx || yum install -y curl git nginx

# 安装 Node.js 20.x
echo "--- 安装 Node.js 20.x ---"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - || \
    curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs || yum install -y nodejs
fi
echo "Node.js 版本: $(node -v)"
echo "npm 版本: $(npm -v)"

# 安装 PM2（进程管理）
echo "--- 安装 PM2 ---"
npm install -g pm2

echo "✅ 系统依赖安装完成！"
REMOTE

if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败！"
    exit 1
fi

# 第4步：部署应用代码
echo ""
echo ">>> 第4步：部署应用代码..."
ssh -i $KEY_FILE -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP << 'REMOTE'
set -e

# 从 GitHub 克隆代码
echo "--- 克隆代码 ---"
cd /root
rm -rf attendance-system
git clone https://github.com/berenpek123-hash/attendance-system.git
cd attendance-system

# 安装后端依赖
echo "--- 安装后端依赖 ---"
cd backend
npm install

# 安装前端依赖并构建
echo "--- 安装前端依赖并打包 ---"
cd ../frontend
npm install
npm run build

echo "✅ 应用代码部署完成！"
REMOTE

if [ $? -ne 0 ]; then
    echo "❌ 代码部署失败！"
    exit 1
fi

# 第5步：配置 Nginx
echo ""
echo ">>> 第5步：配置 Nginx..."
ssh -i $KEY_FILE -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP << REMOTE
set -e

# 创建 Nginx 配置
cat > /etc/nginx/sites-available/attendance-system << 'NGINX'
server {
    listen 80;
    server_name _;

    # 前端静态文件
    root /root/attendance-system/frontend/dist;
    index index.html;

    # 前端路由（SPA）
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # 后端 API 代理
    location /api/ {
        proxy_pass http://127.0.0.1:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_cache_bypass \$http_upgrade;
    }
}
NGINX

# 启用配置
ln -sf /etc/nginx/sites-available/attendance-system /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 测试 Nginx 配置
nginx -t

# 重启 Nginx
systemctl restart nginx
systemctl enable nginx

echo "✅ Nginx 配置完成！"
REMOTE

if [ $? -ne 0 ]; then
    echo "❌ Nginx 配置失败！"
    exit 1
fi

# 第6步：启动后端服务
echo ""
echo ">>> 第6步：使用 PM2 启动后端服务..."
ssh -i $KEY_FILE -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP << 'REMOTE'
set -e

cd /root/attendance-system/backend

# 停止已有的 PM2 进程
pm2 delete all 2>/dev/null || true

# 启动后端
pm2 start server.js --name "attendance-backend"

# 保存 PM2 进程列表（开机自启）
pm2 save
pm2 startup

# 显示状态
pm2 status

echo ""
echo "✅ 后端服务已启动！"
REMOTE

if [ $? -ne 0 ]; then
    echo "❌ 后端启动失败！"
    exit 1
fi

# 第7步：测试
echo ""
echo ">>> 第7步：测试系统..."
sleep 3

# 测试后端
echo "测试后端 API..."
curl -s http://$SERVER_IP/api/health 2>/dev/null && echo "" || echo "后端测试失败"

# 测试前端
echo "测试前端页面..."
curl -s -o /dev/null -w "%{http_code}" http://$SERVER_IP/ && echo " - 前端正常" || echo "前端测试失败"

echo ""
echo "============================================"
echo "🎉 部署完成！"
echo "============================================"
echo ""
echo "📱 前端访问地址: http://$SERVER_IP"
echo "🔐 登陆信息:"
echo "   用户名: admin"
echo "   密码: 123456"
echo ""
echo "📋 员工打卡: http://$SERVER_IP/checkin"
echo ""
echo "============================================"
