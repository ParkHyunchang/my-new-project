<template>
  <div class="home">
    <p v-if="status">백엔드 상태: {{ status }}</p>
    <p v-else-if="error">연결 실패: {{ error }}</p>
    <p v-else>연결 중...</p>
  </div>
</template>

<script>
import axios from '@/axios'

export default {
  name: 'HomeView',
  data() {
    return { status: null, error: null }
  },
  mounted() {
    axios.get('/health')
      .then((res) => { this.status = res.data?.status || 'ok' })
      .catch((err) => { this.error = err.message })
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background-color: #ffffff;
}
</style>
