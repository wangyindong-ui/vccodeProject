import request from './request'

// 1. 获取车辆库存列表 (分页 + 搜索)
export function getCarList(data) {
  return request({
    url: '/cars',
    method: 'post',
    data // 包含 pageNum, pageSize, brand, model
  })
}

// 2. 新车入库
export function addCar(data) {
  return request({
    url: '/carKindAdd',
    method: 'post',
    data
  })
}

// 3. (预留) 获取车辆详情
export function getCarDetail(id) {
  return request({
    url: `/cars/${id}`,
    method: 'get'
  })
}

// 4. (预留) 删除车辆
export function delCar(id) {
  return request({
    url: '/cars/delete',
    method: 'get', // 假设是get，根据实际后端调整
    params: { id }
  })
}