<template>
  <header class="app-header">
    <router-link to="/" class="logo">My New Project</router-link>
    <nav class="nav" :class="{ 'nav--open': mobileMenuOpen }">
      <router-link
        v-for="m in menus"
        :key="m.id"
        :to="m.path"
        class="nav__link"
        active-class="nav__link--active"
        @click="mobileMenuOpen = false"
      >
        {{ m.name }}
      </router-link>
    </nav>
    <div class="header__right">
      <template v-if="isLoggedIn">
        <span class="nav__user">{{ currentUser }}님</span>
        <button type="button" class="nav__btn" @click="logout">로그아웃</button>
      </template>
      <button v-else type="button" class="nav__btn" @click="showLoginPopup">로그인</button>
      <button type="button" class="hamburger" :class="{ 'hamburger--open': mobileMenuOpen }" @click="mobileMenuOpen = !mobileMenuOpen">
        <span></span><span></span><span></span>
      </button>
    </div>
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
      currentUser: '',
      mobileMenuOpen: false
    }
  },
  mounted() {
    const saved = localStorage.getItem('loginUser')
    if (saved) {
      this.isLoggedIn = true
      this.currentUser = saved
    }

    const fallback = [{ id: 1, name: 'Home', path: '/' }, { id: 2, name: 'Test', path: '/test' }]
    axios.get('/api/menus')
      .then((res) => { this.menus = (res.data && res.data.length) ? res.data : fallback })
      .catch(() => { this.menus = fallback })
  },
  methods: {
    showLoginPopup() {
      this.mobileMenuOpen = false
      this.loginPopupVisible = true
    },
    onLoginSuccess({ id }) {
      this.isLoggedIn = true
      this.currentUser = id
      localStorage.setItem('loginUser', id)
    },
    logout() {
      this.isLoggedIn = false
      this.currentUser = ''
      localStorage.removeItem('loginUser')
      this.mobileMenuOpen = false
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

.hamburger {
  display: none;
  flex-direction: column;
  gap: 5px;
  padding: 4px;
  background: transparent;
  border: none;
  cursor: pointer;
}

.hamburger span {
  display: block;
  width: 24px;
  height: 2px;
  background: var(--accent);
  transition: transform 0.3s, opacity 0.3s;
}

.hamburger--open span:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}

.hamburger--open span:nth-child(2) {
  opacity: 0;
}

.hamburger--open span:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

.nav {
  display: flex;
  align-items: center;
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

.header__right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

@media (max-width: 640px) {
  .hamburger {
    display: flex;
  }

  .nav {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    flex-direction: column;
    align-items: stretch;
    gap: 0;
    padding: 0.5rem 0;
    background: var(--surface);
    border-bottom: 1px solid var(--card-border);
    z-index: 100;
  }

  .nav--open {
    display: flex;
  }

  .nav__link {
    padding: 0.75rem 2rem;
    text-align: left;
  }

  .app-header {
    position: relative;
  }
}
</style>
