# PowerShell 启动脚本
$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "========================================"
Write-Host "员工打卡系统 - 启动脚本"
Write-Host "========================================"
Write-Host ""

# 检查 Node.js
$nodeCheck = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ 错误：未检测到 Node.js"
    Write-Host "请先安装 Node.js: https://nodejs.org"
    Read-Host "按 Enter 键退出"
    exit 1
}

Write-Host "✓ Node.js 已安装: $nodeCheck"
Write-Host ""

# 启动后端
Write-Host "正在启动后端服务器 (http://localhost:3000)..."
Push-Location backend
Start-Process cmd.exe -ArgumentList '/k node server.js'
Pop-Location
Start-Sleep -Seconds 2

# 启动前端
Write-Host "正在启动前端服务器 (http://localhost:5173)..."
Push-Location frontend
if (-not (Test-Path node_modules)) {
    Write-Host "首次运行，正在安装依赖..."
    npm install
}
Start-Process cmd.exe -ArgumentList '/k npm run dev'
Pop-Location
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "========================================"
Write-Host "✓ 系统已启动！"
Write-Host ""
Write-Host "管理员登陆: http://localhost:5173"
Write-Host "员工打卡: http://localhost:5173/checkin"
Write-Host ""
Write-Host "默认账号: admin"
Write-Host "========================================"
Write-Host ""
Write-Host "系统即将在浏览器中打开..."
Write-Host ""

Start-Sleep -Seconds 2

# 自动打开浏览器
Start-Process "http://localhost:5173/login"

Write-Host "按 Enter 键关闭此窗口"
Read-Host
