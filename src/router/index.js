import { createRouter, createWebHistory } from 'vue-router'
import AdminView from '../views/AdminView.vue'
import AdminChatHistoryView from '../views/AdminChatHistoryView.vue'

// /admin만 정적 라우트, 나머지는 DB에서 동적으로 로드됨 (App.vue)
const routes = [
  {
    path: '/admin',
    name: 'admin',
    component: AdminView
  },
  {
    path: '/admin/chat',
    name: 'admin-chat',
    component: AdminChatHistoryView
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
