import axios from 'axios'
import { ElMessage } from 'element-plus'

const service = axios.create({
  baseURL: 'http://localhost:8091/api', // 指向 Spring Boot 地址
  timeout: 5000
})

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data
    // 假设后端直接返回数据列表，或者标准的 {code, msg, data} 格式
    // 这里简单处理：如果返回中有 code 且不为 200，则报错
    if (res.code && res.code !== 200) {
      return Promise.reject(new Error(res.msg || 'Error'))
    }
    return res
  },
  error => {
    return Promise.reject(error)
  }
)

export default service