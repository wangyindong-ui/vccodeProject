import request from './request'

// 1. 获取订单列表 (分页 + 搜索)
export function getOrderList(data) { 
  return request({
    url: '/orders/list',
    method: 'post',
    data // ES6写法，等同于 data: data
  })
}

// 2. 新增订单
export function addOrder(data) {
  return request({
    url: '/orders/addOrder',
    method: 'post',
    data
  })
}

// 3. 删除订单
export function delOrder(id) {
  return request({
    url: '/orders/delete',
    method: 'get',
    params: { id }
  })
}
// 4. 派工 / 更新状态
export function dispatchOrder(data) {
  return request({
    url: '/system/orders/dispatch',
    method: 'put',
    data
  })
}

// 5. 导出订单
export function exportOrder(queryData) {
  return request({
    url: '/orders/export',
    method: 'post',
    data: queryData,   // ✅ 关键修改：必须用 data，不能用 params
    responseType: 'blob' 
  })
}

// 6. 获取订单详情
export function getOrder(id) {
  return request({
    url: `/orders/${id}`,
    method: 'get'
  })
}

// 7. 获取新增订单时的关联车型列表 (这是你新增的接口)
export function getLinkCarModels() {
  return request({
    url: '/orders/addOrderLinkCarModel',
    method: 'get'
  })
}


// 8. 【新增】获取接待人员列表 (修复报错的关键)
export function getSalesmanList() {
  return request({
    url: '/users/salesmanList', 
    method: 'get'
  })
}

// 9. 更新订单 (详情编辑)
export function updateOrder(data) {
  return request({
    url: '/orders/orderDetail', // 您指定的接口地址
    method: 'post', // 通常更新操作用 PUT，如果是 POST 请自行修改
    data
  })
}