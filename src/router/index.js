import { createRouter, createWebHistory } from 'vue-router'
import AdminView from '../views/AdminView.vue'

// /admin만 정적 라우트, 나머지는 DB에서 동적으로 로드됨 (App.vue)
const routes = [
  {
    path: '/admin',
    name: 'admin',
    component: AdminView
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
