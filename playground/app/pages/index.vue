<template>
  <div>
    <h1 class="title">Yandex Metrika — API Demo</h1>
    <p class="subtitle">Click buttons to call API methods. Logs appear below (and in DevTools console).</p>

    <div class="buttons">
      <button class="btn" @click="callReachGoal">reachGoal</button>
      <button class="btn" @click="callParams">params</button>
      <button class="btn" @click="callUserParams">userParams</button>
      <button class="btn" @click="callSetUserID">setUserID</button>
      <button class="btn" @click="callNotBounce">notBounce</button>
      <button class="btn" @click="callExtLink">extLink</button>
      <button class="btn" @click="callGetClientID">getClientID</button>
      <button class="btn btn-clear" @click="logs = []">Clear logs</button>
    </div>

    <div class="log-panel">
      <h2 class="log-title">Logs ({{ logs.length }})</h2>
      <pre v-if="logs.length" class="log-content"><template v-for="(entry, i) in logs" :key="i">{{ entry }}
</template></pre>
      <p v-else class="log-empty">No calls yet. Click a button above.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const ym = useYandexMetrika()
const logs = ref<string[]>([])

function log(method: string, args?: unknown) {
  const time = new Date().toLocaleTimeString()
  const detail = args ? ` → ${JSON.stringify(args)}` : ''
  logs.value.unshift(`[${time}] ${method}${detail}`)
}

function callReachGoal() {
  ym.reachGoal('test_goal', { page: 'home' })
  log('reachGoal', { target: 'test_goal', params: { page: 'home' } })
}

function callParams() {
  ym.params({ key: 'value' })
  log('params', { key: 'value' })
}

function callUserParams() {
  ym.userParams({ age: 25 })
  log('userParams', { age: 25 })
}

function callSetUserID() {
  ym.setUserID('user_123')
  log('setUserID', { userID: 'user_123' })
}

function callNotBounce() {
  ym.notBounce()
  log('notBounce')
}

function callExtLink() {
  ym.extLink('https://example.com')
  log('extLink', { url: 'https://example.com' })
}

function callGetClientID() {
  ym.getClientID((clientID) => {
    log('getClientID', { clientID })
  })
  log('getClientID (called)')
}
</script>

<style scoped>
.title {
  font-size: 1.5rem;
  margin-bottom: 4px;
}

.subtitle {
  color: #888;
  font-size: 0.9rem;
  margin-bottom: 20px;
}

.buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
}

.btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fafafa;
  cursor: pointer;
  font-size: 0.85rem;
  font-family: monospace;
  transition: background 0.15s, border-color 0.15s;
}

.btn:hover {
  background: #e8e8e8;
  border-color: #bbb;
}

.btn:active {
  background: #ddd;
}

.btn-clear {
  color: #999;
  border-style: dashed;
}

.log-panel {
  border-top: 1px solid #eee;
  padding-top: 16px;
}

.log-title {
  font-size: 1rem;
  margin-bottom: 8px;
}

.log-content {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 12px;
  border-radius: 6px;
  font-size: 0.8rem;
  max-height: 300px;
  overflow-y: auto;
  line-height: 1.6;
}

.log-empty {
  color: #aaa;
  font-size: 0.85rem;
}
</style>
