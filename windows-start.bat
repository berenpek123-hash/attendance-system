@echo off
chcp 65001 >nul
echo.
echo ========================================
echo 员工打卡系统 - 启动脚本
echo ========================================
echo.

REM 检查 Node.js 是否安装
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ✗ 错误：未检测到 Node.js，请先安装 Node.js
    echo 下载地址：https://nodejs.org
    pause
    exit /b 1
)

echo ✓ Node.js 已安装
echo.

REM 启动后端服务器
echo 正在启动后端服务器...
cd backend
start cmd /k "node server.js"
timeout /t 2 /nobreak

REM 启动前端服务器
echo 正在启动前端服务器...
cd ..\frontend
start cmd /k "npm run dev"

echo.
echo ========================================
echo ✓ 系统已启动！
echo.
echo 管理员登陆：http://localhost:5173
echo 用户名：admin
echo.
echo 员工打卡：http://localhost:5173/checkin
echo ========================================
echo.
echo 请在浏览器中打开上述地址
echo (系统会自动在浏览器中打开)
timeout /t 2 /nobreak

REM 自动打开浏览器
start http://localhost:5173/login

echo.
echo 关闭此窗口时系统仍会运行
pause
