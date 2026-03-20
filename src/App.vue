<template>
  <div class="app">
    <AppHeader />
    <main class="main">
      <router-view />
    </main>
  </div>
</template>

<script>
import AppHeader from '@/components/AppHeader.vue'
import axios from '@/axios'
import { componentRegistry } from '@/componentRegistry'

export default {
  components: { AppHeader },
  async created() {
    try {
      const res = await axios.get('/api/menus/routes')
      res.data.forEach(menu => {
        const comp = componentRegistry[menu.component]
        if (comp) {
          this.$router.addRoute({
            path: menu.path,
            name: menu.name,
            component: comp
          })
        }
      })
      // 동적 라우트 추가 후 현재 경로 재매칭
      await this.$router.replace(this.$route.fullPath).catch(() => {})
    } catch {
      // 백엔드 오류 시 기본 라우트 fallback
      const HomeView = componentRegistry['HomeView']
      const TestView = componentRegistry['TestView']
      if (HomeView) this.$router.addRoute({ path: '/', name: 'home', component: HomeView })
      if (TestView) this.$router.addRoute({ path: '/test', name: 'test', component: TestView })
      await this.$router.replace(this.$route.fullPath).catch(() => {})
    }
  }
}
</script>

<style>
.app {
  min-height: 100vh;
}

.main {
  min-height: calc(100vh - 60px);
}
</style>
