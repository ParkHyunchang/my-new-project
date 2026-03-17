<template>
  <div class="test-page">
    <section class="content-section">
      <h1 class="content__title">Test</h1>
      <p class="content__desc">메뉴에서 이동한 테스트 페이지입니다.</p>
    </section>
  </div>
</template>

<script>
export default {
  name: 'TestView'
}
</script>

<style scoped>
.test-page {
  min-height: calc(100vh - 60px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.content-section {
  text-align: center;
}

.content__title {
  font-family: "Montserrat", sans-serif;
  font-size: clamp(2rem, 6vw, 3rem);
  font-weight: 700;
  color: var(--accent);
  margin-bottom: 1rem;
}

.content__desc {
  color: var(--text-secondary);
  font-size: 1rem;
}
</style>
