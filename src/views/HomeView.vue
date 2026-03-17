<template>
  <div class="home">
    <section class="hero-section">
      <div class="hero__inner">
        <h1 class="hero__title">Welcome</h1>
        <p class="hero__subtitle">My New Project</p>
        <p class="hero__desc">Vue.js + Spring Boot 기반 프로젝트입니다.</p>
        <div class="hero__status">
          <span v-if="status" class="status-ok">백엔드 연결됨</span>
          <span v-else-if="error" class="status-error">백엔드 대기 중</span>
          <span v-else class="status-loading">연결 중...</span>
        </div>
      </div>
    </section>
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
      .catch(() => { this.error = true })
  }
}
</script>

<style scoped>
.hero-section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.hero__inner {
  text-align: center;
  max-width: 600px;
}

.hero__title {
  font-family: "Montserrat", sans-serif;
  font-size: clamp(3rem, 10vw, 5rem);
  font-weight: 700;
  color: var(--accent);
  letter-spacing: 0.08em;
  margin-bottom: 0.5rem;
}

.hero__subtitle {
  font-size: clamp(1.2rem, 3vw, 1.5rem);
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.hero__desc {
  font-size: 1rem;
  color: var(--text-muted);
  margin-bottom: 2rem;
  line-height: 1.6;
}

.hero__status {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.875rem;
  border: 1px solid var(--card-border);
}

.status-ok {
  color: var(--accent);
}

.status-error {
  color: var(--text-muted);
}

.status-loading {
  color: var(--text-secondary);
}
</style>
