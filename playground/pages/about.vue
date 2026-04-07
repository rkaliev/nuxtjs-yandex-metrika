<template>
  <div>
    <h1 class="title">About</h1>
    <p>This page exists to test navigation tracking.</p>
    <p class="hint">
      Navigate back to <NuxtLink to="/">Home</NuxtLink> and check the browser console —
      you should see <code>hit()</code> calls logged by the mock API on each page transition.
    </p>
  </div>
</template>

<style scoped>
.title {
  font-size: 1.5rem;
  margin-bottom: 12px;
}

.hint {
  margin-top: 12px;
  padding: 12px;
  background: #fffbe6;
  border: 1px solid #ffe58f;
  border-radius: 6px;
  font-size: 0.9rem;
  line-height: 1.6;
}

.hint code {
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.85rem;
}

.hint a {
  color: #e44;
  font-weight: 500;
}
</style>
