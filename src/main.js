import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

/* 전역 CSS - 검정/금색 테마 */
import './assets/css/base/fonts.css'
import './assets/css/base/vars.css'
import './assets/css/base/reset.css'

createApp(App).use(router).mount('#app')
