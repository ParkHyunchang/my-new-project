<template>
  <div class="admin-view">
    <div class="admin-tabs">
      <router-link to="/admin" class="admin-tab">메뉴 관리</router-link>
      <router-link to="/admin/chat" class="admin-tab">채팅 히스토리</router-link>
    </div>

    <h1 class="admin-view__title">채팅 히스토리</h1>
    <p class="admin-view__desc">전체 채팅 세션 내역을 확인합니다.</p>

    <div v-if="loading" class="admin-view__loading">불러오는 중...</div>
    <div v-else-if="error" class="admin-view__error">{{ error }}</div>
    <div v-else-if="sessions.length === 0" class="admin-view__loading">채팅 기록이 없습니다.</div>

    <template v-else>
      <div class="table-wrapper">
      <table class="menu-table">
        <thead>
          <tr>
            <th>세션 ID</th>
            <th>사용자</th>
            <th>메시지 수</th>
            <th class="hide-mobile">마지막 활동</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <template v-for="session in sessions" :key="session.sessionKey">
            <tr class="session-row" @click="toggleSession(session.sessionKey)">
              <td class="session-key">{{ session.sessionKey.slice(0, 8) }}...</td>
              <td>{{ session.username || '익명' }}</td>
              <td>{{ session.messageCount }}개</td>
              <td class="hide-mobile">{{ formatDate(session.lastActivity) }}</td>
              <td class="expand-icon">{{ expandedKey === session.sessionKey ? '▲' : '▼' }}</td>
            </tr>
            <tr v-if="expandedKey === session.sessionKey" class="messages-row">
              <td colspan="5">
                <div v-if="messagesLoading" class="messages-loading">불러오는 중...</div>
                <div v-else class="messages-list">
                  <div
                    v-for="(msg, i) in expandedMessages"
                    :key="i"
                    class="msg-item"
                    :class="msg.role"
                  >
                    <span class="msg-role">{{ msg.role === 'user' ? '사용자' : 'AI' }}</span>
                    <pre class="msg-content">{{ msg.content }}</pre>
                  </div>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
      </div>
    </template>
  </div>
</template>

<script>
import axios from '@/axios'

export default {
  name: 'AdminChatHistoryView',
  data() {
    return {
      sessions: [],
      loading: true,
      error: '',
      token: '',
      expandedKey: null,
      expandedMessages: [],
      messagesLoading: false,
    }
  },
  mounted() {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      this.$router.push('/')
      return
    }
    this.token = token
    this.loadSessions()
  },
  methods: {
    loadSessions() {
      this.loading = true
      this.error = ''
      axios.get('/api/admin/chat/sessions', {
        headers: { Authorization: `Bearer ${this.token}` }
      })
        .then(res => { this.sessions = res.data })
        .catch(err => {
          if (err.response?.status === 401) {
            localStorage.removeItem('loginUser')
            localStorage.removeItem('adminToken')
            window.location.replace('/')
          } else {
            this.error = '데이터를 불러오지 못했습니다.'
          }
        })
        .finally(() => { this.loading = false })
    },
    toggleSession(sessionKey) {
      if (this.expandedKey === sessionKey) {
        this.expandedKey = null
        this.expandedMessages = []
        return
      }
      this.expandedKey = sessionKey
      this.expandedMessages = []
      this.messagesLoading = true
      axios.get(`/api/admin/chat/sessions/${sessionKey}/messages`, {
        headers: { Authorization: `Bearer ${this.token}` }
      })
        .then(res => { this.expandedMessages = res.data })
        .catch(() => { this.expandedMessages = [] })
        .finally(() => { this.messagesLoading = false })
    },
    formatDate(dateStr) {
      if (!dateStr) return '-'
      const d = new Date(dateStr)
      return d.toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
    },
  },
}
</script>

<style scoped>
.admin-view {
  max-width: 960px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.admin-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--card-border);
  padding-bottom: 0;
}

.admin-tab {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
  text-decoration: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: color 0.15s, border-color 0.15s;
}

.admin-tab:hover,
.admin-tab.router-link-active {
  color: var(--accent);
  border-bottom-color: var(--accent);
}

.admin-view__title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--accent);
  margin-bottom: 0.5rem;
}

.admin-view__desc {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.admin-view__loading,
.admin-view__error {
  color: var(--text-secondary);
  text-align: center;
  padding: 2rem;
}

.admin-view__error { color: #e57373; }

.menu-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--surface);
  border: 1px solid var(--card-border);
  border-radius: 8px;
  overflow: hidden;
}

.menu-table th {
  padding: 0.75rem 1rem;
  text-align: left;
  font-size: 0.85rem;
  color: var(--text-secondary);
  background: var(--surface-2);
  border-bottom: 1px solid var(--card-border);
}

.menu-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--card-border);
  color: var(--text-primary);
  font-size: 0.9rem;
}

.session-row {
  cursor: pointer;
  transition: background 0.15s;
}

.session-row:hover td {
  background: var(--accent-dim);
}

.session-key {
  font-family: monospace;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.expand-icon {
  text-align: right;
  color: var(--text-muted);
  font-size: 0.75rem;
}

.messages-row td {
  padding: 0;
  background: var(--surface-2, #0d0d0d);
}

.messages-loading {
  padding: 1rem 1.5rem;
  color: var(--text-muted);
  font-size: 0.875rem;
}

.messages-list {
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 400px;
  overflow-y: auto;
}

.msg-item {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.msg-role {
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
  min-width: 40px;
  padding-top: 0.15rem;
}

.msg-item.user .msg-role { color: var(--accent); }
.msg-item.assistant .msg-role { color: var(--text-muted); }

.msg-content {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-primary);
  white-space: pre-wrap;
  word-break: break-word;
  font-family: inherit;
  line-height: 1.5;
}

.table-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

@media (max-width: 640px) {
  .hide-mobile {
    display: none;
  }

  .menu-table th,
  .menu-table td {
    padding: 0.6rem 0.75rem;
    font-size: 0.82rem;
  }

  .messages-list {
    padding: 0.75rem 1rem;
  }
}
</style>
