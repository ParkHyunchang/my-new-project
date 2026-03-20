<template>
  <header class="app-header">
    <router-link to="/" class="logo">My New Project</router-link>
    <nav class="nav" :class="{ 'nav--open': mobileMenuOpen }">
      <router-link
        v-for="m in menus"
        :key="m.id"
        :to="m.path"
        class="nav__link"
        :class="{ 'nav__link--active': $route.path === m.path, 'nav__link--hidden': m.visible === false }"
        @click="mobileMenuOpen = false"
      >{{ m.name }}{{ m.visible === false ? ' (숨김)' : '' }}</router-link>
    </nav>
    <div class="header__right">
      <!-- 데스크탑 전용 -->
      <template v-if="isLoggedIn">
        <router-link to="/admin" class="nav__btn desktop-only">관리자</router-link>
        <span class="nav__user desktop-only">{{ currentUser }}님</span>
        <button type="button" class="nav__btn desktop-only" @click="logout">로그아웃</button>
      </template>
      <button v-else type="button" class="nav__btn desktop-only" @click="showLoginPopup">로그인</button>

      <!-- 모바일 전용: 아바타 or 로그인 버튼 -->
      <div v-if="isLoggedIn" class="mobile-avatar-wrapper mobile-only" @click.stop="toggleUserDropdown">
        <div class="mobile-avatar">{{ userInitial }}</div>
        <transition name="dropdown-fade">
          <div v-if="showUserDropdown" class="mobile-user-dropdown" @click.stop>
            <div class="dropdown-user-header">
              <div class="dropdown-avatar-lg">{{ userInitial }}</div>
              <div class="dropdown-user-meta">
                <span class="dropdown-username">{{ currentUser }}</span>
              </div>
            </div>
            <div class="dropdown-divider"></div>
            <router-link to="/admin" class="dropdown-item" @click="closeAll">관리자</router-link>
            <button class="dropdown-logout-btn" @click="logout">로그아웃</button>
          </div>
        </transition>
      </div>
      <button v-else type="button" class="nav__btn mobile-only" @click="showLoginPopup">로그인</button>

      <button type="button" class="hamburger" :class="{ 'hamburger--open': mobileMenuOpen }" @click="toggleMenu">
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
      mobileMenuOpen: false,
      showUserDropdown: false,
      adminToken: ''
    }
  },
  computed: {
    userInitial() {
      return this.currentUser?.charAt(0)?.toUpperCase() || '?'
    }
  },
  mounted() {
    const saved = localStorage.getItem('loginUser')
    const savedToken = localStorage.getItem('adminToken')
    if (saved && savedToken) {
      this.isLoggedIn = true
      this.currentUser = saved
      this.adminToken = savedToken
    } else {
      localStorage.removeItem('loginUser')
      localStorage.removeItem('adminToken')
    }
    this.loadMenus()
    document.addEventListener('click', this.handleDocumentClick)
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleDocumentClick)
  },
  methods: {
    loadMenus() {
      const fallback = [{ id: 1, name: 'Home', path: '/' }, { id: 2, name: 'Test', path: '/test' }]
      if (this.adminToken) {
        axios.get('/api/admin/menus', { headers: { Authorization: `Bearer ${this.adminToken}` } })
          .then(res => { this.menus = (res.data && res.data.length) ? res.data : fallback })
          .catch(err => {
            if (err.response?.status === 401) {
              this.isLoggedIn = false
              this.currentUser = ''
              this.adminToken = ''
              localStorage.removeItem('loginUser')
              localStorage.removeItem('adminToken')
            }
            this.menus = fallback
          })
      } else {
        axios.get('/api/menus')
          .then(res => { this.menus = (res.data && res.data.length) ? res.data : fallback })
          .catch(() => { this.menus = fallback })
      }
    },
    toggleMenu() {
      this.mobileMenuOpen = !this.mobileMenuOpen
      this.showUserDropdown = false
    },
    toggleUserDropdown() {
      this.showUserDropdown = !this.showUserDropdown
      this.mobileMenuOpen = false
    },
    closeAll() {
      this.mobileMenuOpen = false
      this.showUserDropdown = false
    },
    handleDocumentClick(event) {
      if (!event.target.closest('.mobile-avatar-wrapper') && this.showUserDropdown) {
        this.showUserDropdown = false
      }
      if (!event.target.closest('.nav') && !event.target.closest('.hamburger') && this.mobileMenuOpen) {
        this.mobileMenuOpen = false
      }
    },
    showLoginPopup() {
      this.closeAll()
      this.loginPopupVisible = true
    },
    onLoginSuccess({ id, token }) {
      this.isLoggedIn = true
      this.currentUser = id
      this.adminToken = token
      localStorage.setItem('loginUser', id)
      localStorage.setItem('adminToken', token)
      this.loadMenus()
    },
    logout() {
      this.isLoggedIn = false
      this.currentUser = ''
      this.adminToken = ''
      localStorage.removeItem('loginUser')
      localStorage.removeItem('adminToken')
      this.closeAll()
      this.loadMenus()
      this.$router.push('/')
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
  position: relative;
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

.hamburger--open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.hamburger--open span:nth-child(2) { opacity: 0; }
.hamburger--open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

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

.nav__link--hidden {
  opacity: 0.4;
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
  text-decoration: none;
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

/* 모바일 아바타 */
.mobile-avatar-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.mobile-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), #8a6030);
  color: #1a1510;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  border: 1px solid var(--accent);
}

.mobile-user-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  background: var(--surface);
  border-radius: 10px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.5);
  border: 1px solid var(--card-border);
  min-width: 200px;
  z-index: 20000;
  overflow: hidden;
}

.dropdown-user-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: var(--accent-dim);
}

.dropdown-avatar-lg {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), #8a6030);
  color: #1a1510;
  font-size: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.dropdown-user-meta {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.dropdown-username {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-divider {
  height: 1px;
  background: var(--card-border);
}

.dropdown-item {
  display: block;
  padding: 12px 16px;
  font-size: 13px;
  color: var(--text-secondary);
  text-decoration: none;
  transition: background 0.15s;
}

.dropdown-item:hover {
  background: var(--accent-dim);
  color: var(--accent);
}

.dropdown-logout-btn {
  width: 100%;
  padding: 12px 16px;
  background: none;
  border: none;
  text-align: left;
  font-size: 13px;
  font-weight: 500;
  color: #c45a5a;
  cursor: pointer;
  transition: background 0.15s;
}

.dropdown-logout-btn:hover {
  background: rgba(196, 90, 90, 0.1);
}

.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* 반응형 */
.mobile-only { display: none; }

@media (max-width: 640px) {
  .hamburger { display: flex; }
  .desktop-only { display: none; }
  .mobile-only { display: flex; }

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

  .nav--open { display: flex; }

  .nav__link {
    padding: 0.75rem 2rem;
    text-align: left;
  }
}
</style>
