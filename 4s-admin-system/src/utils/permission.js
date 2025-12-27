import request from './request'

/**
 * 获取所有角色列表
 * @param {Object} params - 查询参数 { roleName, status }
 */
export const getAllRoles = (params = {}) => {
  return request({
    url: '/role/roleList',
    method: 'get',
    params: {
      pageNo: params.pageNo || 1,
      pageSize: params.pageSize || 1000, // 获取所有角色
      roleName: params.roleName,
      status: params.status
    }
  })
}

/**
 * 获取角色的菜单权限
 * @param {Number} roleId - 角色ID
 */
export const getRoleMenus = (roleId) => {
  return request({
    url: `/role/${roleId}/menus`,
    method: 'get'
  })
}

/**
 * 更新角色的菜单权限
 * @param {Number} roleId - 角色ID
 * @param {Array} menuIds - 菜单ID数组
 */
export const updateRoleMenus = (roleId, menuIds) => {
  return request({
    url: `/role/${roleId}/menus`,
    method: 'put',
    data: { menuIds }
  })
}

/**
 * 获取所有菜单列表
 * @param {Object} params - 查询参数 { name, title }
 */
export const getAllMenus = (params = {}) => {
  return request({
    url: '/menu/menuList',
    method: 'post',
    data: {
      pageNum: params.pageNum || 1,
      pageSize: params.pageSize || 1000, // 获取所有菜单
      name: params.name,
      title: params.title
    }
  })
}

/**
 * 新增菜单
 * @param {Object} data - 菜单数据 { name, path, title, icon, parentId }
 */
export const addMenu = (data) => {
  return request({
    url: '/menu/add',
    method: 'post',
    data
  })
}

/**
 * 删除菜单
 * @param {Number} menuId - 菜单ID
 */
export const deleteMenu = (menuId) => {
  return request({
    url: `/menu/${menuId}`,
    method: 'delete'
  })
}

/**
 * 更新菜单
 * @param {Number} menuId - 菜单ID
 * @param {Object} data - 菜单数据
 */
export const updateMenu = (menuId, data) => {
  return request({
    url: `/menu/${menuId}`,
    method: 'put',
    data
  })
}
