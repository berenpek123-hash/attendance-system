<template>
  <div class="checkin-container">
    <div class="checkin-card">
      <h2>📱 员工打卡</h2>
      
      <div class="input-group">
        <label>输入员工号或扫描二维码：</label>
        <input 
          v-model="employeeId" 
          @keyup.enter="handleCheckin"
          type="text"
          placeholder="员工号（如：EMP001）或员工ID（数字）"
          autofocus
        >
      </div>

      <button @click="handleCheckin" class="btn btn-primary">打卡</button>

      <!-- 摄像头输入选项 -->
      <div class="camera-section">
        <p class="text-muted">或使用摄像头扫码：</p>
        <button @click="toggleCamera" class="btn btn-secondary">
          {{ cameraActive ? '关闭摄像头' : '打开摄像头' }}
        </button>
        
        <div v-if="cameraActive" class="camera-container">
          <video ref="video" autoplay playsinline style="width: 100%; border-radius: 4px;"></video>
          <canvas ref="canvas" style="display: none;"></canvas>
        </div>
      </div>

      <!-- 打卡结果 -->
      <div v-if="message" :class="['message', messageType]">
        <div class="message-title">{{ messageTitle }}</div>
        <div class="message-content">{{ message }}</div>
        <div v-if="checkinTime" class="message-time">打卡时间: {{ checkinTime }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onUnmounted } from 'vue'
import { checkin } from '../api'
import jsQR from 'jsqr'

export default {
  name: 'Checkin',
  setup() {
    const employeeId = ref('')
    const message = ref('')
    const messageType = ref('')
    const messageTitle = ref('')
    const checkinTime = ref('')
    const cameraActive = ref(false)
    const video = ref(null)
    const canvas = ref(null)
    let scanningInterval = null

    const handleCheckin = async () => {
      if (!employeeId.value.trim()) {
        setMessage('请输入员工号或员工ID', 'error', '错误')
        return
      }

      try {
        // 清除之前的消息
        setMessage('', '', '')
        checkinTime.value = ''

        // 直接调用打卡API（后端支持员工号和员工ID）
        const res = await checkin(employeeId.value.trim())
        const data = res.data

        if (data.success) {
          const lateTag = data.isLate ? ' (迟到)' : ''
          setMessage(
            `${data.employeeName} - ${data.message}${lateTag}`,
            'success',
            data.type === 'check_in' ? '上班打卡 ✓' : '下班打卡 ✓'
          )
          checkinTime.value = data.time

          // 清空输入框，准备下一次打卡
          setTimeout(() => {
            employeeId.value = ''
          }, 3000)
        }
      } catch (error) {
        const errorMsg = error.response?.data?.error || error.message || '打卡失败'
        setMessage(errorMsg, 'error', '错误')
      }
    }

    const setMessage = (msg, type, title) => {
      message.value = msg
      messageType.value = type
      messageTitle.value = title
    }

    const toggleCamera = () => {
      if (cameraActive.value) {
        stopCamera()
      } else {
        startCamera()
      }
    }

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        })
        
        if (video.value) {
          video.value.srcObject = stream
          video.value.play()
          cameraActive.value = true
          
          scanningInterval = setInterval(() => {
            scanQRCode()
          }, 100)
        }
      } catch (error) {
        setMessage('无法访问摄像头: ' + error.message, 'error', '错误')
      }
    }

    const stopCamera = () => {
      if (video.value && video.value.srcObject) {
        video.value.srcObject.getTracks().forEach(track => track.stop())
      }
      cameraActive.value = false
      
      if (scanningInterval) {
        clearInterval(scanningInterval)
        scanningInterval = null
      }
    }

    const scanQRCode = () => {
      if (!video.value || !canvas.value || video.value.videoWidth === 0) return
      
      const ctx = canvas.value.getContext('2d')
      canvas.value.width = video.value.videoWidth
      canvas.value.height = video.value.videoHeight
      
      ctx.drawImage(video.value, 0, 0)
      
      const imageData = ctx.getImageData(0, 0, canvas.value.width, canvas.value.height)
      const code = jsQR(imageData.data, canvas.value.width, canvas.value.height)
      
      if (code && code.data) {
        const data = code.data
        if (data.startsWith('ATTENDANCE_')) {
          employeeId.value = data.replace('ATTENDANCE_', '')
        } else {
          employeeId.value = data
        }
        handleCheckin()
        stopCamera()
      }
    }

    onUnmounted(() => {
      stopCamera()
    })

    return {
      employeeId,
      message,
      messageType,
      messageTitle,
      checkinTime,
      cameraActive,
      video,
      canvas,
      handleCheckin,
      toggleCamera
    }
  }
}
</script>

<style scoped>
.checkin-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 70vh;
  padding: 2rem;
}

.checkin-card {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 500px;
}

h2 {
  margin-bottom: 1.5rem;
  color: #333;
  text-align: center;
}

.input-group {
  margin-bottom: 1.5rem;
}

.input-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #666;
  font-weight: 500;
}

.input-group input {
  width: 100%;
  padding: 0.8rem;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.input-group input:focus {
  outline: none;
  border-color: #667eea;
}

.btn {
  width: 100%;
  padding: 0.8rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 1rem;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.camera-section {
  margin: 1.5rem 0;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 4px;
  text-align: center;
}

.text-muted {
  color: #999;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.camera-container {
  margin-top: 1rem;
  overflow: hidden;
  border-radius: 4px;
}

.message {
  padding: 1rem;
  border-radius: 4px;
  margin-top: 1.5rem;
  animation: slideIn 0.3s ease-out;
}

.message.success {
  background: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
}

.message.error {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
}

.message-title {
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.message-content {
  font-size: 1rem;
}

.message-time {
  font-size: 0.85rem;
  opacity: 0.8;
  margin-top: 0.5rem;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
