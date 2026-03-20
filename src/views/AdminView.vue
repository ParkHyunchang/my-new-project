<template>
  <div class="admin-view">
    <h1 class="admin-view__title">메뉴 관리</h1>
    <p class="admin-view__desc">로그인하지 않은 방문자에게 표시할 메뉴를 설정합니다.</p>

    <div v-if="loading" class="admin-view__loading">불러오는 중...</div>
    <div v-else-if="error" class="admin-view__error">{{ error }}</div>
    <table v-else class="menu-table">
      <thead>
        <tr>
          <th>순서</th>
          <th>메뉴명</th>
          <th>경로</th>
          <th>컴포넌트</th>
          <th>공개 여부</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="menu in menus" :key="menu.id" :class="{ 'menu-row--hidden': !menu.visible }">
          <td>{{ menu.sortOrder }}</td>
          <td>{{ menu.name }}</td>
          <td>{{ menu.path }}</td>
          <td>
            <input
              class="component-input"
              :value="menu.component"
              @change="updateComponent(menu, $event.target.value)"
              placeholder="예: HomeView"
            />
          </td>
          <td>
            <label class="toggle">
              <input type="checkbox" :checked="menu.visible" @change="toggleVisible(menu)" />
              <span class="toggle__slider"></span>
            </label>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from '@/axios'

export default {
  name: 'AdminView',
  data() {
    return {
      menus: [],
      loading: true,
      error: '',
      token: ''
    }
  },
  mounted() {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      this.$router.push('/')
      return
    }
    this.token = token
    this.loadMenus()
  },
  methods: {
    loadMenus() {
      this.loading = true
      this.error = ''
      axios.get('/api/admin/menus', {
        headers: { Authorization: `Bearer ${this.token}` }
      })
        .then(res => { this.menus = res.data })
        .catch(err => {
          if (err.response?.status === 401) {
            localStorage.removeItem('loginUser')
            localStorage.removeItem('adminToken')
            window.location.replace('/')
          } else {
            this.error = '메뉴를 불러오지 못했습니다.'
          }
        })
        .finally(() => { this.loading = false })
    },
    toggleVisible(menu) {
      axios.put(`/api/admin/menus/${menu.id}`, { visible: !menu.visible }, {
        headers: { Authorization: `Bearer ${this.token}` }
      })
        .then(res => { menu.visible = res.data.visible })
        .catch(() => { alert('변경에 실패했습니다.') })
    },
    updateComponent(menu, value) {
      axios.put(`/api/admin/menus/${menu.id}`, { component: value || null }, {
        headers: { Authorization: `Bearer ${this.token}` }
      })
        .then(res => { menu.component = res.data.component })
        .catch(() => { alert('변경에 실패했습니다.') })
    }
  }
}
</script>

<style scoped>
.admin-view {
  max-width: 860px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.admin-view__title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--accent);
  margin-bottom: 0.5rem;
}

.admin-view__desc {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.admin-view__loading,
.admin-view__error {
  color: var(--text-secondary);
  text-align: center;
  padding: 2rem;
}

.admin-view__error {
  color: #e57373;
}

.menu-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--surface);
  border: 1px solid var(--card-border);
  border-radius: 8px;
  overflow: hidden;
}

.menu-table th {
  padding: 0.75rem 1rem;
  text-align: left;
  font-size: 0.85rem;
  color: var(--text-secondary);
  background: var(--surface-2);
  border-bottom: 1px solid var(--card-border);
}

.menu-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--card-border);
  color: var(--text-primary);
}

.menu-table tbody tr:last-child td {
  border-bottom: none;
}

.menu-row--hidden td {
  opacity: 0.5;
}

.component-input {
  width: 120px;
  padding: 0.3rem 0.5rem;
  font-size: 0.85rem;
  color: var(--text-primary);
  background: var(--surface);
  border: 1px solid var(--card-border);
  border-radius: 4px;
}

.component-input:focus {
  outline: none;
  border-color: var(--accent);
}

/* Toggle switch */
.toggle {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle__slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background: var(--card-border);
  border-radius: 24px;
  transition: background 0.2s;
}

.toggle__slider::before {
  content: '';
  position: absolute;
  width: 18px;
  height: 18px;
  left: 3px;
  top: 3px;
  background: white;
  border-radius: 50%;
  transition: transform 0.2s;
}

.toggle input:checked + .toggle__slider {
  background: var(--accent);
}

.toggle input:checked + .toggle__slider::before {
  transform: translateX(20px);
}
</style>
