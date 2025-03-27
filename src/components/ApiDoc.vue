<!-- ApiDoc.vue -->
<template>
  <div v-html="html" class="markdown-body p-5" />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import MarkdownIt from 'markdown-it'

const html = ref('')
const md = new MarkdownIt()

onMounted(async () => {
  const res = await fetch('/src/apidoc/api-document.md')
  const text = await res.text()
  html.value = md.render(text)
})
</script>

<style scoped>
.markdown-body {
  line-height: 1.6;
  font-size: 1rem;
}
pre {
  background: #f9f9f9;
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
}
</style>
