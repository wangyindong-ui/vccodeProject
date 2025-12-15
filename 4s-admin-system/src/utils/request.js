import axios from 'axios'
import { ElMessage } from 'element-plus'
import JSONbig from 'json-bigint' 

// 配置 json-bigint
const JSONbigString = JSONbig({ storeAsString: true })

// 后端服务地址
const API_BASE_URL = 'http://localhost:8091/api'

const service = axios.create({
  baseURL: API_BASE_URL, // 指向 Spring Boot 地址
  timeout: 50000000,
  
  // 处理后端返回的大数字 ID
  transformResponse: [function (data) {
    try {
      return JSONbigString.parse(data)
    } catch (err) {
      return data
    }
  }]
})

// ==========================================
// 1. 新增：请求拦截器 (Request Interceptor)
// ==========================================
service.interceptors.request.use(
  config => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('token')
    
    // 如果有 token，这就加到请求头中
    // 后端通常从 'token' 或 'Authorization' 字段读取
    if (token) {
      config.headers['token'] = token 
      // 或者标准写法: config.headers['Authorization'] = token
    }
    
    return config
  },
  error => {
    console.log(error) 
    return Promise.reject(error)
  }
)

// ==========================================
// 2. 响应拦截器 (Response Interceptor)
// ==========================================
service.interceptors.response.use(
  response => {
    const res = response.data
    
    // 兼容逻辑：有的接口返回二进制流(如导出)，没有 code 字段
    // 如果 res 是 Blob 或 ArrayBuffer，直接返回
    if (response.config.responseType === 'blob' || response.config.responseType === 'arraybuffer') {
      return res
    }

    // 业务逻辑错误处理
    if (res.code && res.code !== 200) {
      ElMessage.error(res.msg || res.message || 'Error')
      
      // 可以在这里处理 token 过期 (例如 code === 401)
      if (res.code === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        // location.href = '/login' // 强制跳转登录
      }
      
      return Promise.reject(new Error(res.msg || 'Error'))
    }
    return res
  },
  error => {
    console.error('err' + error) 
    let msg = error.message || '请求失败'
    if (error.response && error.response.data) {
        // 尝试读取后端返回的具体错误信息
        msg = error.response.data.msg || error.response.data.message || msg
    }
    ElMessage.error(msg)
    return Promise.reject(error)
  }
)

export default service
export { API_BASE_URL }