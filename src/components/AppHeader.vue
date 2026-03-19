<template>
  <header class="app-header">
    <router-link to="/" class="logo">My New Project</router-link>
    <nav class="nav">
      <router-link
        v-for="m in menus"
        :key="m.id"
        :to="m.path"
        class="nav__link"
        active-class="nav__link--active"
      >
        {{ m.name }}
      </router-link>
      <template v-if="isLoggedIn">
        <span class="nav__user">{{ currentUser }}님</span>
        <button type="button" class="nav__btn" @click="logout">로그아웃</button>
      </template>
      <button v-else type="button" class="nav__btn" @click="showLoginPopup">로그인</button>
    </nav>
    <LoginPopup
      :visible="loginPopupVisible"
      @close="loginPopupVisible = false"
      @login-success="onLoginSuccess"
    />
  </header>
</template>

<script>
import axios from '@/axios'
import LoginPopup from '@/components/LoginPopup.vue'

export default {
  name: 'AppHeader',
  components: { LoginPopup },
  data() {
    return {
      menus: [],
      loginPopupVisible: false,
      isLoggedIn: false,
      currentUser: ''
    }
  },
  mounted() {
    const fallback = [{ id: 1, name: 'Home', path: '/' }, { id: 2, name: 'Test', path: '/test' }]
    axios.get('/api/menus')
      .then((res) => { this.menus = (res.data && res.data.length) ? res.data : fallback })
      .catch(() => { this.menus = fallback })
  },
  methods: {
    showLoginPopup() {
      this.loginPopupVisible = true
    },
    onLoginSuccess({ id }) {
      this.isLoggedIn = true
      this.currentUser = id
    },
    logout() {
      this.isLoggedIn = false
      this.currentUser = ''
    }
  }
}
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background: var(--surface);
  border-bottom: 1px solid var(--card-border);
}

.logo {
  font-weight: 600;
  color: var(--accent);
}

.nav {
  display: flex;
  gap: 1.5rem;
}

.nav__link {
  color: var(--text-secondary);
}

.nav__link:hover,
.nav__link--active {
  color: var(--accent);
}

.nav__user {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.nav__btn {
  padding: 0.375rem 0.75rem;
  font-size: 0.9rem;
  color: var(--accent);
  background: transparent;
  border: 1px solid var(--card-border);
  border-radius: 6px;
  cursor: pointer;
}

.nav__btn:hover {
  background: var(--accent-dim);
  border-color: var(--accent);
}
</style>
