<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="visible" class="login-overlay" @click.self="close">
        <div class="login-popup">
          <button class="login-popup__close" type="button" aria-label="닫기" @click="close">×</button>
          <h2 class="login-popup__title">로그인</h2>
          <form class="login-form" @submit.prevent="handleLogin">
            <div class="form-group">
              <label for="login-id">아이디</label>
              <input
                id="login-id"
                v-model="id"
                type="text"
                autocomplete="username"
                placeholder="아이디 입력"
              >
            </div>
            <div class="form-group">
              <label for="login-pw">비밀번호</label>
              <input
                id="login-pw"
                v-model="password"
                type="password"
                autocomplete="current-password"
                placeholder="비밀번호 입력"
              >
            </div>
            <p v-if="errorMsg" class="login-form__error">{{ errorMsg }}</p>
            <button type="submit" class="login-form__submit" :disabled="loading">
              {{ loading ? '로그인 중...' : '로그인' }}
            </button>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
import axios from '@/axios'

export default {
  name: 'LoginPopup',
  props: {
    visible: { type: Boolean, default: false }
  },
  emits: ['close', 'login-success'],
  data() {
    return {
      id: '',
      password: '',
      errorMsg: '',
      loading: false
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.id = ''
        this.password = ''
        this.errorMsg = ''
      }
    }
  },
  methods: {
    close() {
      this.$emit('close')
    },
    async handleLogin() {
      this.errorMsg = ''
      this.loading = true
      try {
        const res = await axios.post('/api/auth/login', {
          username: this.id.trim(),
          password: this.password
        })
        if (res.data && res.data.success) {
          this.$emit('login-success', { id: res.data.username, token: res.data.token })
          this.close()
        } else {
          this.errorMsg = res.data?.message || '로그인에 실패했습니다.'
        }
      } catch (err) {
        const msg = err.response?.data?.message || err.message || '로그인에 실패했습니다.'
        this.errorMsg = msg
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.login-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.login-popup {
  position: relative;
  width: 100%;
  max-width: 380px;
  padding: 2rem;
  background: var(--surface-2);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.login-popup__close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  border-radius: 6px;
}

.login-popup__close:hover {
  color: var(--text-primary);
  background: var(--accent-dim);
}

.login-popup__title {
  margin: 0 0 1.5rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--accent);
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.375rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.form-group input {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  color: var(--text-primary);
  background: var(--surface);
  border: 1px solid var(--card-border);
  border-radius: 8px;
  box-sizing: border-box;
}

.form-group input::placeholder {
  color: var(--text-muted);
}

.form-group input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 2px var(--accent-dim);
}

.login-form__error {
  margin: 0 0 1rem;
  font-size: 0.875rem;
  color: #e57373;
}

.login-form__submit {
  width: 100%;
  padding: 0.875rem;
  font-size: 1rem;
  font-weight: 600;
  color: var(--primary);
  background: var(--accent);
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.login-form__submit:hover {
  background: var(--accent-light);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
