<template>
  <div class="chat-page">

    <!-- 사이드바 (항상 표시) -->
    <aside class="chat-sidebar" :class="{ 'sidebar--open': sidebarOpen }">
      <div class="sidebar-header">
        <button class="new-chat-btn" @click="startNewChat">+ 새 대화</button>
      </div>
      <div class="session-list">
        <div
          v-for="s in sessions"
          :key="s.sessionKey"
          class="session-item"
          :class="{ active: s.sessionKey === sessionKey }"
          @click="switchSession(s.sessionKey)"
        >
          <span class="session-title">{{ s.title || '새 대화' }}</span>
          <span class="session-date">{{ formatDate(s.lastActivity) }}</span>
        </div>
        <div v-if="sessions.length === 0 && !initialLoading" class="session-empty">대화 없음</div>
      </div>
    </aside>

    <!-- 채팅 영역 -->
    <div class="chat-main">
      <div class="chat-header">
        <button class="sidebar-toggle" @click="sidebarOpen = !sidebarOpen">☰</button>
        <div class="chat-header-text">
          <h2 class="chat-title">AI Chat</h2>
          <p class="chat-subtitle">Claude AI와 대화하세요</p>
        </div>
      </div>

      <div class="messages" ref="messagesEl">
        <div v-if="historyLoading" class="empty-state">불러오는 중...</div>
        <div v-else-if="messages.length === 0" class="empty-state">무엇이든 물어보세요.</div>
        <div
          v-for="(msg, i) in messages"
          :key="i"
          class="message"
          :class="msg.role"
        >
          <div class="message__bubble">
            <pre class="message__text">{{ msg.content }}</pre>
          </div>
        </div>
        <div v-if="loading" class="message assistant">
          <div class="message__bubble">
            <span class="loading-dots"><span>.</span><span>.</span><span>.</span></span>
          </div>
        </div>
      </div>

      <form class="chat-input-area" @submit.prevent="send">
        <textarea
          v-model="input"
          class="chat-input"
          placeholder="메시지를 입력하세요..."
          rows="1"
          @keydown.enter.exact.prevent="send"
          @input="autoResize"
          ref="inputEl"
          :disabled="loading || historyLoading"
        />
        <button class="send-btn" type="submit" :disabled="loading || historyLoading || !input.trim()">
          전송
        </button>
      </form>
    </div>

    <!-- 모바일 사이드바 오버레이 -->
    <div v-if="sidebarOpen" class="sidebar-overlay" @click="sidebarOpen = false" />
  </div>
</template>

<script>
import axios from '@/axios'

export default {
  name: 'ChatView',
  data() {
    return {
      messages: [],
      input: '',
      loading: false,
      historyLoading: false,
      initialLoading: true,
      sessionKey: '',
      isLoggedIn: false,
      username: '',
      sessions: [],
      sidebarOpen: false,
    }
  },
  mounted() {
    this.username = localStorage.getItem('loginUser') || ''
    this.isLoggedIn = !!this.username

    if (this.isLoggedIn) {
      this.loadUserSessions()
    } else {
      this.loadAnonSessions()
    }
  },
  methods: {
    // ── 세션 로드 ──────────────────────────────────────────────

    loadUserSessions() {
      axios.get(`/api/chat/sessions/${this.username}`)
        .then(res => {
          this.sessions = res.data
          if (this.sessions.length > 0) {
            const stored = localStorage.getItem(`chat_current_${this.username}`)
            const current = this.sessions.find(s => s.sessionKey === stored) || this.sessions[0]
            this.switchSession(current.sessionKey)
          } else {
            this.startNewChat()
          }
        })
        .catch(() => this.startNewChat())
        .finally(() => { this.initialLoading = false })
    },

    loadAnonSessions() {
      const keys = this.getAnonSessionKeys()
      if (keys.length === 0) {
        this.startNewChat()
        this.initialLoading = false
        return
      }
      axios.post('/api/chat/sessions/by-keys', keys)
        .then(res => {
          this.sessions = res.data
          const currentKey = localStorage.getItem('chat_anon_current')
          const current = this.sessions.find(s => s.sessionKey === currentKey) || this.sessions[0]
          if (current) this.switchSession(current.sessionKey)
          else this.startNewChat()
        })
        .catch(() => this.startNewChat())
        .finally(() => { this.initialLoading = false })
    },

    // ── 세션 관리 ──────────────────────────────────────────────

    getAnonSessionKeys() {
      try { return JSON.parse(localStorage.getItem('chat_anon_sessions') || '[]') } catch { return [] }
    },

    startNewChat() {
      const newKey = crypto.randomUUID()
      this.sessionKey = newKey
      this.messages = []
      this.historyLoading = false

      if (this.isLoggedIn) {
        localStorage.setItem(`chat_current_${this.username}`, newKey)
      } else {
        const keys = this.getAnonSessionKeys()
        keys.unshift(newKey)
        localStorage.setItem('chat_anon_sessions', JSON.stringify(keys))
        localStorage.setItem('chat_anon_current', newKey)
      }

      // 사이드바에 '새 대화' 플레이스홀더 추가 (첫 메시지 전송 후 제목 채워짐)
      this.sessions = [
        { sessionKey: newKey, title: null, lastActivity: null, messageCount: 0 },
        ...this.sessions.filter(s => s.sessionKey !== newKey),
      ]
      this.sidebarOpen = false
    },

    switchSession(key) {
      this.sessionKey = key
      if (this.isLoggedIn) {
        localStorage.setItem(`chat_current_${this.username}`, key)
      } else {
        localStorage.setItem('chat_anon_current', key)
      }
      this.sidebarOpen = false
      this.loadHistory()
    },

    // ── 히스토리 로드 ──────────────────────────────────────────

    loadHistory() {
      if (!this.sessionKey) return
      this.historyLoading = true
      axios.get(`/api/chat/history/${this.sessionKey}`)
        .then(res => {
          this.messages = res.data.map(r => ({ role: r.role, content: r.content }))
          this.$nextTick(() => this.scrollToBottom())
        })
        .catch(() => {})
        .finally(() => { this.historyLoading = false })
    },

    // ── 메시지 전송 ────────────────────────────────────────────

    async send() {
      const text = this.input.trim()
      if (!text || this.loading) return

      this.messages.push({ role: 'user', content: text })
      this.input = ''
      this.$nextTick(() => this.autoResize())
      this.loading = true
      this.scrollToBottom()

      try {
        const res = await axios.post('/api/chat', {
          sessionKey: this.sessionKey,
          content: text,
          username: this.isLoggedIn ? this.username : null,
        })
        this.messages.push({ role: 'assistant', content: res.data.content })
        this.refreshSessions()
      } catch {
        this.messages.push({ role: 'assistant', content: '오류가 발생했습니다. 잠시 후 다시 시도해주세요.' })
      } finally {
        this.loading = false
        this.$nextTick(() => this.scrollToBottom())
      }
    },

    refreshSessions() {
      if (this.isLoggedIn) {
        axios.get(`/api/chat/sessions/${this.username}`)
          .then(res => { this.sessions = res.data })
      } else {
        const keys = this.getAnonSessionKeys()
        if (keys.length > 0) {
          axios.post('/api/chat/sessions/by-keys', keys)
            .then(res => { this.sessions = res.data })
        }
      }
    },

    // ── UI 유틸 ────────────────────────────────────────────────

    scrollToBottom() {
      this.$nextTick(() => {
        const el = this.$refs.messagesEl
        if (el) el.scrollTop = el.scrollHeight
      })
    },

    autoResize() {
      const el = this.$refs.inputEl
      if (!el) return
      el.style.height = 'auto'
      el.style.height = Math.min(el.scrollHeight, 160) + 'px'
    },

    formatDate(dateStr) {
      if (!dateStr) return ''
      const d = new Date(dateStr)
      const now = new Date()
      if (d.toDateString() === now.toDateString()) {
        return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
      }
      return d.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })
    },
  },
}
</script>

<style scoped>
.chat-page {
  display: flex;
  height: calc(100dvh - 57px);
  overflow: hidden;
}

/* ── 사이드바 ────────────────────────────────── */
.chat-sidebar {
  width: 220px;
  flex-shrink: 0;
  border-right: 1px solid var(--card-border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--surface);
}

.sidebar-header {
  padding: 0.75rem;
  border-bottom: 1px solid var(--card-border);
  flex-shrink: 0;
}

.new-chat-btn {
  width: 100%;
  padding: 0.5rem 0.75rem;
  background: transparent;
  border: 1px solid var(--card-border);
  border-radius: 6px;
  color: var(--accent);
  font-size: 0.85rem;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s, border-color 0.15s;
}

.new-chat-btn:hover {
  background: var(--accent-dim);
  border-color: var(--accent);
}

.session-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.4rem 0;
}

.session-item {
  padding: 0.6rem 0.75rem;
  cursor: pointer;
  border-radius: 6px;
  margin: 0 0.4rem;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  transition: background 0.15s;
}

.session-item:hover {
  background: var(--accent-dim);
}

.session-item.active {
  background: var(--accent-dim);
  border-left: 2px solid var(--accent);
  padding-left: calc(0.75rem - 2px);
}

.session-title {
  font-size: 0.8rem;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.session-item.active .session-title {
  color: var(--accent);
}

.session-date {
  font-size: 0.7rem;
  color: var(--text-muted);
}

.session-empty {
  padding: 1rem;
  font-size: 0.8rem;
  color: var(--text-muted);
  text-align: center;
}

/* ── 채팅 메인 ───────────────────────────────── */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

.chat-header {
  padding: 0.85rem 1.25rem;
  border-bottom: 1px solid var(--card-border);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.sidebar-toggle {
  background: transparent;
  border: 1px solid var(--card-border);
  border-radius: 6px;
  color: var(--text-secondary);
  padding: 0.3rem 0.5rem;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  flex-shrink: 0;
  display: none;
}

.chat-header-text { display: flex; flex-direction: column; }

.chat-title {
  font-family: "Montserrat", sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--accent);
  margin: 0;
}

.chat-subtitle {
  font-size: 0.78rem;
  color: var(--text-muted);
  margin: 0;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.message { display: flex; }
.message.user { justify-content: flex-end; }
.message.assistant { justify-content: flex-start; }

.message__bubble {
  max-width: 72%;
  padding: 0.7rem 0.95rem;
  border-radius: 8px;
  font-size: 0.9rem;
  line-height: 1.6;
}

.message.user .message__bubble {
  background: var(--accent);
  color: #000;
}

.message.assistant .message__bubble {
  border: 1px solid var(--card-border);
  color: var(--text-primary, #eee);
}

.message__text {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: inherit;
  font-size: inherit;
}

.loading-dots { display: inline-flex; gap: 2px; }

.loading-dots span {
  animation: blink 1.2s infinite;
  color: var(--text-muted);
  font-size: 1.4rem;
  line-height: 1;
}

.loading-dots span:nth-child(2) { animation-delay: 0.2s; }
.loading-dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes blink {
  0%, 80%, 100% { opacity: 0.2; }
  40% { opacity: 1; }
}

.chat-input-area {
  display: flex;
  gap: 0.75rem;
  padding: 0.85rem 1.25rem;
  border-top: 1px solid var(--card-border);
  flex-shrink: 0;
  align-items: flex-end;
}

.chat-input {
  flex: 1;
  background: transparent;
  border: 1px solid var(--card-border);
  border-radius: 6px;
  color: var(--text-primary, #eee);
  font-size: 0.9rem;
  padding: 0.6rem 0.85rem;
  resize: none;
  outline: none;
  line-height: 1.5;
  transition: border-color 0.2s;
}

.chat-input:focus { border-color: var(--accent); }
.chat-input::placeholder { color: var(--text-muted); }

.send-btn {
  background: var(--accent);
  color: #000;
  border: none;
  border-radius: 6px;
  padding: 0.6rem 1.1rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: opacity 0.2s;
  white-space: nowrap;
}

.send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.send-btn:not(:disabled):hover { opacity: 0.85; }

/* ── 모바일 ──────────────────────────────────── */
.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 99;
}

@media (max-width: 640px) {
  .sidebar-toggle {
    display: block;
  }

  .chat-sidebar {
    position: fixed;
    top: 57px;
    left: 0;
    bottom: 0;
    z-index: 100;
    width: 260px;
    transform: translateX(-100%);
    transition: transform 0.25s ease;
  }

  .chat-sidebar.sidebar--open {
    transform: translateX(0);
  }

  .chat-header {
    padding: 0.65rem 0.9rem;
  }

  .messages {
    padding: 0.9rem 1rem;
  }

  .message__bubble {
    max-width: 85%;
  }

  .chat-input-area {
    padding: 0.65rem 0.9rem;
  }
}
</style>
