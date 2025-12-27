<template>
  <div class="permission-management-view">
    <!-- 顶部标题 -->
    <div class="chinese-card header-section">
      <div class="card-title-bar">
        <span class="title-text">:: 角色菜单权限管理 ::</span>
        <span class="subtitle">为不同角色分配可访问的菜单页面</span>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="chinese-card main-content">
      <div class="permission-layout">
        <!-- 左侧：角色列表 -->
        <div class="role-panel">
          <div class="panel-header">
            <h3 class="panel-title">角色列表</h3>
            <el-input
              v-model="roleSearchText"
              placeholder="搜索角色..."
              class="search-input"
              clearable
              :prefix-icon="Search"
            />
          </div>

          <div class="role-list" v-loading="roleLoading">
            <div
              v-for="role in filteredRoles"
              :key="role.id"
              :class="['role-item', { active: selectedRole?.id === role.id }]"
              @click="selectRole(role)"
            >
              <div class="role-info">
                <el-icon class="role-icon"><Avatar /></el-icon>
                <div class="role-details">
                  <div class="role-name">{{ role.name || role.roleName }}</div>
                  <div class="role-desc">{{ role.description || role.remark || '暂无描述' }}</div>
                </div>
              </div>
              <el-icon class="arrow-icon" v-if="selectedRole?.id === role.id">
                <ArrowRight />
              </el-icon>
            </div>

            <el-empty 
              v-if="filteredRoles.length === 0 && roleList.length === 0" 
              description="暂无角色数据，请先在角色管理页面创建角色" 
            />
            <el-empty 
              v-else-if="filteredRoles.length === 0" 
              description="没有找到匹配的角色" 
            />
          </div>
        </div>

        <!-- 右侧：菜单权限配置 -->
        <div class="menu-panel">
          <div class="panel-header">
            <div class="header-left">
              <h3 class="panel-title">
                菜单权限配置
                <span v-if="selectedRole" class="current-role">
                  (当前: {{ selectedRole.name || selectedRole.roleName }})
                </span>
              </h3>
            </div>
            <div class="header-right">
              <el-button
                class="chinese-btn-gold"
                :icon="Plus"
                @click="openAddMenuDialog"
                size="small"
              >
                新增菜单页
              </el-button>
              <el-button
                v-if="selectedRole"
                class="chinese-btn-vermilion"
                :icon="Select"
                @click="savePermissions"
                :loading="saveLoading"
                size="small"
              >
                保存权限
              </el-button>
            </div>
          </div>

          <div class="menu-content" v-loading="menuLoading">
            <!-- 未选择角色时的提示 -->
            <div v-if="!selectedRole" class="no-role-selected">
              <el-alert
                title="请先选择角色"
                type="info"
                description="从左侧角色列表中选择一个角色，然后为其分配菜单权限"
                :closable="false"
                show-icon
              />
              
              <!-- 显示所有可用菜单供预览 -->
              <div class="available-menus-preview" v-if="menuList.length > 0">
                <h4 class="preview-title">系统可用菜单 (共 {{ menuList.length }} 个)</h4>
                <div class="menu-list preview-mode">
                  <div
                    v-for="menu in menuList"
                    :key="menu.id"
                    class="menu-item preview"
                  >
                    <div class="menu-info">
                      <el-icon class="menu-icon" :style="{ color: menu.iconColor }">
                        <component :is="menu.icon || 'Menu'" />
                      </el-icon>
                      <div class="menu-details">
                        <div class="menu-title">{{ menu.title }}</div>
                        <div class="menu-path">{{ menu.path }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <el-empty 
                v-else 
                description="暂无菜单数据，请点击上方'新增菜单页'按钮添加" 
                :image-size="120"
              />
            </div>

            <!-- 已选择角色时的菜单配置 -->
            <div v-else class="menu-tree-wrapper">
              <div class="menu-actions">
                <el-checkbox
                  v-model="checkAll"
                  :indeterminate="isIndeterminate"
                  @change="handleCheckAllChange"
                  class="check-all-box"
                >
                  全选/取消全选
                </el-checkbox>
                <el-tag type="info" effect="plain">
                  已选择: {{ checkedMenus.length }} / {{ menuList.length }}
                </el-tag>
              </div>

              <div class="menu-list">
                <div
                  v-for="menu in menuList"
                  :key="menu.id"
                  class="menu-item"
                >
                  <el-checkbox
                    v-model="menu.checked"
                    @change="handleMenuCheck"
                    class="menu-checkbox"
                  >
                    <div class="menu-info">
                      <el-icon class="menu-icon" :style="{ color: menu.iconColor }">
                        <component :is="menu.icon || 'Menu'" />
                      </el-icon>
                      <div class="menu-details">
                        <div class="menu-title">{{ menu.title }}</div>
                        <div class="menu-path">{{ menu.path }}</div>
                      </div>
                    </div>
                  </el-checkbox>
                  <el-button
                    link
                    type="danger"
                    :icon="Delete"
                    @click="handleDeleteMenu(menu)"
                    size="small"
                    class="delete-btn"
                  >
                    删除
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增菜单对话框 -->
    <el-dialog
      v-model="addMenuVisible"
      title="新增菜单页"
      width="550px"
      class="chinese-dialog"
      @close="resetMenuForm"
    >
      <el-form :model="menuForm" :rules="menuRules" ref="menuFormRef" label-width="100px">
        <el-form-item label="菜单名称" prop="name">
          <el-input
            v-model="menuForm.name"
            placeholder="如: Car (组件名称)"
            clearable
          />
        </el-form-item>

        <el-form-item label="菜单路径" prop="path">
          <el-input
            v-model="menuForm.path"
            placeholder="如: /cars"
            clearable
          >
            <template #prepend>/</template>
          </el-input>
        </el-form-item>

        <el-form-item label="中文标题" prop="title">
          <el-input
            v-model="menuForm.title"
            placeholder="如: 车库管理"
            clearable
          />
        </el-form-item>

        <el-form-item label="图标" prop="icon">
          <el-select
            v-model="menuForm.icon"
            placeholder="选择图标"
            clearable
            filterable
          >
            <el-option
              v-for="icon in iconOptions"
              :key="icon.value"
              :label="icon.label"
              :value="icon.value"
            >
              <el-icon style="margin-right: 8px"><component :is="icon.value" /></el-icon>
              {{ icon.label }}
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="组件路径" prop="component">
          <el-input
            v-model="menuForm.component"
            placeholder="如: views/Car.vue"
            clearable
          />
        </el-form-item>

        <el-form-item label="排序" prop="sort">
          <el-input-number
            v-model="menuForm.sort"
            :min="0"
            :max="999"
            placeholder="数字越小越靠前"
          />
        </el-form-item>

        <el-form-item label="备注">
          <el-input
            v-model="menuForm.remark"
            type="textarea"
            rows="3"
            placeholder="可选填写"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button class="chinese-btn-default-plain" @click="addMenuVisible = false">
            取消
          </el-button>
          <el-button
            class="chinese-btn-vermilion-solid"
            :loading="submitLoading"
            @click="submitMenuForm"
          >
            <el-icon style="margin-right: 4px"><Upload /></el-icon>
            确认添加
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Avatar,
  ArrowRight,
  Plus,
  Select,
  Menu,
  Delete,
  Upload,
  Van,
  Document,
  Setting,
  User,
  Tools,
  Odometer,
  Box,
  Coin,
  Monitor,
  Calendar,
  Management
} from '@element-plus/icons-vue'
import {
  getAllRoles,
  getRoleMenus,
  updateRoleMenus,
  getAllMenus,
  addMenu,
  deleteMenu
} from '../utils/permission'

// ============ 数据定义 ============
const roleLoading = ref(false)
const menuLoading = ref(false)
const saveLoading = ref(false)
const submitLoading = ref(false)
const addMenuVisible = ref(false)
const menuFormRef = ref(null)

const roleSearchText = ref('')
const roleList = ref([])
const selectedRole = ref(null)
const menuList = ref([])
const checkAll = ref(false)
const isIndeterminate = ref(false)

const menuForm = reactive({
  name: '',
  path: '',
  title: '',
  icon: 'Menu',
  component: '',
  sort: 0,
  remark: ''
})

const menuRules = {
  name: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
  path: [{ required: true, message: '请输入菜单路径', trigger: 'blur' }],
  title: [{ required: true, message: '请输入中文标题', trigger: 'blur' }],
  component: [{ required: true, message: '请输入组件路径', trigger: 'blur' }]
}

// 图标选项
const iconOptions = [
  { label: '菜单', value: 'Menu' },
  { label: '首页', value: 'Odometer' },
  { label: '车辆', value: 'Van' },
  { label: '文档', value: 'Document' },
  { label: '工具', value: 'Tools' },
  { label: '设置', value: 'Setting' },
  { label: '用户', value: 'User' },
  { label: '盒子', value: 'Box' },
  { label: '金币', value: 'Coin' },
  { label: '监控', value: 'Monitor' },
  { label: '日历', value: 'Calendar' },
  { label: '管理', value: 'Management' }
]

// ============ 计算属性 ============
const filteredRoles = computed(() => {
  if (!roleSearchText.value) return roleList.value
  const keyword = roleSearchText.value.toLowerCase()
  return roleList.value.filter(role => {
    const name = (role.name || role.roleName || '').toLowerCase()
    const desc = (role.description || role.remark || '').toLowerCase()
    return name.includes(keyword) || desc.includes(keyword)
  })
})

const checkedMenus = computed(() => {
  return menuList.value.filter(menu => menu.checked)
})

// ============ 方法定义 ============
// 获取所有角色
const fetchRoles = async () => {
  roleLoading.value = true
  try {
    const res = await getAllRoles()
    if (res.code === 200) {
      // 处理分页数据
      roleList.value = res.data?.records || res.data || []
    } else {
      ElMessage.error(res.message || '获取角色列表失败')
    }
  } catch (error) {
    console.error('获取角色失败:', error)
    ElMessage.warning('无法连接后端服务，请检查后端是否启动 (端口: 8091)')
    // 使用模拟数据以便前端开发
    roleList.value = []
  } finally {
    roleLoading.value = false
  }
}

// 获取所有菜单
const fetchMenus = async () => {
  menuLoading.value = true
  try {
    const res = await getAllMenus()
    if (res.code === 200) {
      // 处理分页数据
      const menus = res.data?.records || res.data || []
      
      if (menus.length === 0) {
        // 如果后端返回空数据，使用默认菜单
        menuList.value = getDefaultMenus()
      } else {
        // 为每个菜单添加checked属性和随机颜色
        menuList.value = menus.map(menu => ({
          ...menu,
          checked: false,
          iconColor: getRandomColor()
        }))
      }
    } else {
      ElMessage.error(res.message || '获取菜单列表失败')
      menuList.value = getDefaultMenus()
    }
  } catch (error) {
    console.error('获取菜单失败:', error)
    ElMessage.warning('无法获取菜单数据，使用默认菜单列表')
    // 如果后端还没实现，使用默认菜单
    menuList.value = getDefaultMenus()
  } finally {
    menuLoading.value = false
  }
}

// 获取默认菜单列表（前端硬编码）
const getDefaultMenus = () => {
  return [
    { id: 1, name: 'Dashboard', path: '/dashboard', title: '首页概览', icon: 'Odometer', checked: false, iconColor: '#409EFF' },
    { id: 2, name: 'Car', path: '/cars', title: '车库管理', icon: 'Van', checked: false, iconColor: '#67C23A' },
    { id: 3, name: 'Service', path: '/service', title: '售后维修', icon: 'Tools', checked: false, iconColor: '#E6A23C' },
    { id: 4, name: 'Inventory', path: '/inventory', title: '配件库存', icon: 'Box', checked: false, iconColor: '#F56C6C' },
    { id: 5, name: 'Dictionary', path: '/dictionary', title: '字典表管理', icon: 'Document', checked: false, iconColor: '#909399' },
    { id: 6, name: 'Role', path: '/role', title: '角色管理', icon: 'User', checked: false, iconColor: '#C0392B' },
    { id: 7, name: 'Profile', path: '/profile', title: '个人中心', icon: 'Setting', checked: false, iconColor: '#D4AC0D' },
    { id: 8, name: 'OrderList', path: '/orders', title: '订单管理', icon: 'Coin', checked: false, iconColor: '#1ABC9C' },
    { id: 9, name: 'TestDrive', path: '/test-drive', title: '试驾预约管理', icon: 'Calendar', checked: false, iconColor: '#9B59B6' },
    { id: 10, name: 'CameraPlayer', path: '/monitor', title: '实时监控', icon: 'Monitor', checked: false, iconColor: '#34495E' }
  ]
}

// 生成随机颜色
const getRandomColor = () => {
  const colors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399', '#C0392B', '#D4AC0D', '#1ABC9C', '#9B59B6', '#34495E']
  return colors[Math.floor(Math.random() * colors.length)]
}

// 选择角色
const selectRole = async (role) => {
  selectedRole.value = role
  await loadRoleMenus(role.id)
}

// 加载角色的菜单权限
const loadRoleMenus = async (roleId) => {
  menuLoading.value = true
  try {
    const res = await getRoleMenus(roleId)
    if (res.code === 200) {
      const roleMenuIds = res.data || []
      
      // 更新菜单的checked状态
      menuList.value.forEach(menu => {
        menu.checked = roleMenuIds.includes(menu.id)
      })
      
      updateCheckAllStatus()
    } else {
      ElMessage.error(res.message || '获取角色菜单失败')
    }
  } catch (error) {
    console.error('获取角色菜单失败:', error)
    // 如果后端还没实现，默认全不选中
    menuList.value.forEach(menu => {
      menu.checked = false
    })
  } finally {
    menuLoading.value = false
  }
}

// 处理单个菜单勾选变化
const handleMenuCheck = () => {
  updateCheckAllStatus()
}

// 更新全选状态
const updateCheckAllStatus = () => {
  const checkedCount = menuList.value.filter(m => m.checked).length
  checkAll.value = checkedCount === menuList.value.length
  isIndeterminate.value = checkedCount > 0 && checkedCount < menuList.value.length
}

// 处理全选/取消全选
const handleCheckAllChange = (val) => {
  menuList.value.forEach(menu => {
    menu.checked = val
  })
  isIndeterminate.value = false
}

// 保存权限
const savePermissions = async () => {
  if (!selectedRole.value) {
    ElMessage.warning('请先选择角色')
    return
  }

  const checkedMenuIds = menuList.value
    .filter(menu => menu.checked)
    .map(menu => menu.id)

  if (checkedMenuIds.length === 0) {
    ElMessageBox.confirm(
      '未勾选任何菜单，该角色将无法访问任何页面，是否继续？',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(async () => {
      await doSavePermissions(checkedMenuIds)
    }).catch(() => {
      ElMessage.info('已取消操作')
    })
  } else {
    await doSavePermissions(checkedMenuIds)
  }
}

// 执行保存权限
const doSavePermissions = async (menuIds) => {
  saveLoading.value = true
  try {
    const res = await updateRoleMenus(selectedRole.value.id, menuIds)
    if (res.code === 200) {
      ElMessage.success(`已为角色 "${selectedRole.value.name || selectedRole.value.roleName}" 分配 ${menuIds.length} 个菜单权限`)
    } else {
      ElMessage.error(res.message || '保存权限失败')
    }
  } catch (error) {
    console.error('保存权限失败:', error)
    ElMessage.error('保存权限失败')
  } finally {
    saveLoading.value = false
  }
}

// 打开新增菜单对话框
const openAddMenuDialog = () => {
  addMenuVisible.value = true
}

// 重置菜单表单
const resetMenuForm = () => {
  menuForm.name = ''
  menuForm.path = ''
  menuForm.title = ''
  menuForm.icon = 'Menu'
  menuForm.component = ''
  menuForm.sort = 0
  menuForm.remark = ''
  menuFormRef.value?.clearValidate()
}

// 提交菜单表单
const submitMenuForm = () => {
  menuFormRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        // 处理路径格式
        let path = menuForm.path.trim()
        if (!path.startsWith('/')) {
          path = '/' + path
        }

        const data = {
          name: menuForm.name.trim(),
          path: path,
          title: menuForm.title.trim(),
          icon: menuForm.icon,
          component: menuForm.component.trim(),
          sort: menuForm.sort,
          remark: menuForm.remark.trim()
        }

        const res = await addMenu(data)
        if (res.code === 200) {
          ElMessage.success('菜单添加成功')
          addMenuVisible.value = false
          await fetchMenus() // 重新加载菜单列表
        } else {
          ElMessage.error(res.message || '添加菜单失败')
        }
      } catch (error) {
        console.error('添加菜单失败:', error)
        ElMessage.error('添加菜单失败')
      } finally {
        submitLoading.value = false
      }
    }
  })
}

// 删除菜单
const handleDeleteMenu = (menu) => {
  ElMessageBox.confirm(
    `确定要删除菜单 "${menu.title}" 吗？删除后相关角色将无法访问此页面。`,
    '警告',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const res = await deleteMenu(menu.id)
      if (res.code === 200) {
        ElMessage.success('菜单删除成功')
        await fetchMenus() // 重新加载菜单列表
      } else {
        ElMessage.error(res.message || '删除菜单失败')
      }
    } catch (error) {
      console.error('删除菜单失败:', error)
      ElMessage.error('删除菜单失败')
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// ============ 生命周期 ============
onMounted(async () => {
  await fetchRoles()
  await fetchMenus()
})
</script>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap');

$vermilion: #C0392B;
$imperial-gold: #D4AC0D;
$ink-black: #2C3E50;
$border-color: #E5E0D5;

.permission-management-view {
  padding: 20px;

  .chinese-card {
    background: #fff;
    border: 1px solid $border-color;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
    position: relative;
    background-image: url('https://www.transparenttextures.com/patterns/rice-paper-2.png');

    &::before {
      content: '';
      position: absolute;
      top: 4px;
      left: 4px;
      right: 4px;
      bottom: 4px;
      border: 1px solid rgba($imperial-gold, 0.2);
      pointer-events: none;
      z-index: 0;
    }
  }

  .header-section {
    .card-title-bar {
      text-align: center;
      position: relative;
      z-index: 1;

      .title-text {
        font-weight: bold;
        color: $ink-black;
        font-family: 'Noto Serif SC', serif;
        font-size: 20px;
        display: block;
        margin-bottom: 8px;
      }

      .subtitle {
        color: #7f8c8d;
        font-size: 14px;
        display: block;
      }
    }
  }

  .main-content {
    min-height: 70vh;
    padding: 30px;
  }

  .permission-layout {
    display: flex;
    gap: 30px;
    height: 100%;
    position: relative;
    z-index: 1;
  }

  .role-panel {
    width: 320px;
    border-right: 2px solid $border-color;
    padding-right: 30px;

    .panel-header {
      margin-bottom: 20px;

      .panel-title {
        font-size: 16px;
        font-weight: bold;
        color: $ink-black;
        margin: 0 0 15px 0;
        font-family: 'Noto Serif SC', serif;
        border-left: 4px solid $vermilion;
        padding-left: 10px;
      }

      .search-input {
        width: 100%;
      }
    }

    .role-list {
      max-height: 60vh;
      overflow-y: auto;
      padding-right: 5px;

      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-thumb {
        background-color: rgba($imperial-gold, 0.4);
        border-radius: 3px;
      }

      .role-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px;
        margin-bottom: 10px;
        border: 1px solid $border-color;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s;
        background: #fff;

        &:hover {
          border-color: $imperial-gold;
          background: rgba($imperial-gold, 0.05);
          transform: translateX(5px);
        }

        &.active {
          border-color: $vermilion;
          background: rgba($vermilion, 0.05);
          box-shadow: 0 2px 8px rgba($vermilion, 0.2);
        }

        .role-info {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;

          .role-icon {
            font-size: 28px;
            color: $imperial-gold;
          }

          .role-details {
            flex: 1;

            .role-name {
              font-weight: bold;
              color: $ink-black;
              font-size: 15px;
              margin-bottom: 4px;
            }

            .role-desc {
              font-size: 12px;
              color: #95a5a6;
            }
          }
        }

        .arrow-icon {
          color: $vermilion;
          font-size: 18px;
        }
      }
    }
  }

  .menu-panel {
    flex: 1;

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      .header-left {
        .panel-title {
          font-size: 16px;
          font-weight: bold;
          color: $ink-black;
          margin: 0;
          font-family: 'Noto Serif SC', serif;
          border-left: 4px solid $vermilion;
          padding-left: 10px;

          .current-role {
            color: $imperial-gold;
            font-size: 14px;
            margin-left: 8px;
          }
        }
      }

      .header-right {
        display: flex;
        gap: 10px;
      }
    }

    .menu-content {
      min-height: 50vh;

      .no-role-selected {
        .el-alert {
          margin-bottom: 30px;
        }

        .available-menus-preview {
          margin-top: 20px;

          .preview-title {
            font-size: 15px;
            color: $ink-black;
            margin-bottom: 15px;
            padding-left: 10px;
            border-left: 3px solid $imperial-gold;
            font-family: 'Noto Serif SC', serif;
          }

          .menu-list.preview-mode {
            .menu-item.preview {
              opacity: 0.7;
              cursor: default;

              &:hover {
                transform: none;
              }
            }
          }
        }
      }

      .menu-tree-wrapper {
        .menu-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          background: rgba($imperial-gold, 0.05);
          border: 1px dashed $imperial-gold;
          border-radius: 4px;
          margin-bottom: 20px;

          .check-all-box {
            font-weight: bold;
            font-family: 'Noto Serif SC', serif;
          }
        }

        .menu-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 15px;

          .menu-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            border: 1px solid $border-color;
            border-radius: 4px;
            transition: all 0.3s;
            background: #fff;

            &:hover {
              border-color: $imperial-gold;
              box-shadow: 0 2px 8px rgba($imperial-gold, 0.2);
              transform: translateY(-2px);

              .delete-btn {
                opacity: 1;
              }
            }

            .menu-checkbox {
              flex: 1;

              :deep(.el-checkbox__label) {
                width: 100%;
              }
            }

            .menu-info {
              display: flex;
              align-items: center;
              gap: 12px;

              .menu-icon {
                font-size: 24px;
              }

              .menu-details {
                .menu-title {
                  font-weight: bold;
                  color: $ink-black;
                  font-size: 15px;
                  margin-bottom: 4px;
                }

                .menu-path {
                  font-size: 12px;
                  color: #95a5a6;
                  font-family: 'Courier New', monospace;
                }
              }
            }

            .delete-btn {
              opacity: 0;
              transition: opacity 0.3s;
            }
          }
        }
      }
    }
  }

  .chinese-btn-gold {
    background-color: $imperial-gold;
    border-color: $imperial-gold;
    border-radius: 2px;
    font-family: 'Noto Serif SC';

    &:hover {
      background-color: darken($imperial-gold, 8%);
    }
  }

  .chinese-btn-vermilion {
    background-color: $vermilion;
    border-color: $vermilion;
    border-radius: 2px;
    font-family: 'Noto Serif SC';

    &:hover {
      background-color: darken($vermilion, 8%);
    }
  }

  .chinese-btn-default-plain {
    background: transparent !important;
    border: 1px solid $ink-black !important;
    color: $ink-black !important;
    font-family: 'Noto Serif SC', serif;
    border-radius: 2px;

    &:hover {
      background: rgba(0, 0, 0, 0.05) !important;
    }
  }

  .chinese-btn-vermilion-solid {
    background-color: $vermilion !important;
    border-color: $vermilion !important;
    color: #fff !important;
    font-family: 'Noto Serif SC', serif;
    border-radius: 2px;
    letter-spacing: 1px;
    margin-left: 15px;

    &:hover {
      background-color: darken($vermilion, 10%) !important;
    }
  }
}
</style>

<style lang="scss">
$vermilion: #C0392B;
$imperial-gold: #D4AC0D;
$ink-black: #2C3E50;

.chinese-dialog {
  .el-dialog__header {
    border-bottom: 1px solid rgba($imperial-gold, 0.3);
    margin-right: 0;
    text-align: center;

    .el-dialog__title {
      font-family: 'Noto Serif SC', serif;
      color: $ink-black;
      font-weight: bold;
      font-size: 18px;
    }
  }

  .el-dialog__body {
    padding: 20px 30px;
  }

  .el-form-item__label {
    font-family: 'Noto Serif SC', serif;
    color: $ink-black;
    font-weight: bold;
  }
}

.el-checkbox__input.is-checked .el-checkbox__inner {
  background-color: $vermilion;
  border-color: $vermilion;
}

.el-checkbox__input.is-indeterminate .el-checkbox__inner {
  background-color: $vermilion;
  border-color: $vermilion;
}
</style>
