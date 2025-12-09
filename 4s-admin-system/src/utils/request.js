import axios from 'axios'
import { ElMessage } from 'element-plus'
import JSONbig from 'json-bigint' // 1. 引入 json-bigint

// 2. 配置 json-bigint
// storeAsString: true 表示将超过 JS 安全范围的大数字转为字符串，而不是 BigNumber 对象
// 这样你的 ID "1997..." 就会变成字符串 "1997..."，前端组件可以直接使用
const JSONbigString = JSONbig({ storeAsString: true })

const service = axios.create({
  baseURL: 'http://localhost:8091/api', // 指向 Spring Boot 地址
  timeout: 5000,
  
  // 3. 【核心修复】重写 transformResponse
  // 这里的 data 是后端返回的原始字符串（尚未被转为 JSON 对象）
  transformResponse: [function (data) {
    try {
      // 尝试使用 json-bigint 解析
      // 如果 data 是 JSON 字符串，这里会正确处理 Long 类型精度
      return JSONbigString.parse(data)
    } catch (err) {
      // 如果不是 JSON（比如是文件流、纯文本或空），则原样返回
      return data
    }
  }]
})

// 响应拦截器
service.interceptors.response.use(
  response => {
    // 此时 response.data 已经是被 json-bigint 解析过的对象了
    // 所有的长 ID 都已经是字符串类型
    const res = response.data
    
    // 假设后端直接返回数据列表，或者标准的 {code, msg, data} 格式
    // 这里简单处理：如果返回中有 code 且不为 200，则报错
    if (res.code && res.code !== 200) {
      // 如果后端有返回错误信息，显示它
      ElMessage.error(res.msg || 'Error')
      return Promise.reject(new Error(res.msg || 'Error'))
    }
    return res
  },
  error => {
    // 处理 HTTP 状态码错误 (如 404, 500)
    console.error('err' + error) 
    let msg = error.message || '请求失败'
    if (error.response && error.response.data) {
        msg = error.response.data.msg || msg
    }
    ElMessage.error(msg)
    return Promise.reject(error)
  }
)

export default service