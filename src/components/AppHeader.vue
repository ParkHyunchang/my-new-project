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
    </nav>
  </header>
</template>

<script>
import axios from '@/axios'

export default {
  name: 'AppHeader',
  data() {
    return { menus: [] }
  },
  mounted() {
    const fallback = [{ id: 1, name: 'Home', path: '/' }, { id: 2, name: 'Test', path: '/test' }]
    axios.get('/api/menus')
      .then((res) => { this.menus = (res.data && res.data.length) ? res.data : fallback })
      .catch(() => { this.menus = fallback })
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
</style>
