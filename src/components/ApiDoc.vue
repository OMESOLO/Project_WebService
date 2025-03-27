<template>
    <div class="p-5">
      <component :is="DocComponent" />
    </div>
  </template>
  
  <script setup>
  import { shallowRef, onMounted } from 'vue'
  
  const DocComponent = shallowRef(null)
  
  onMounted(async () => {
    const module = await import('@/apidoc/api-document.md')
    DocComponent.value = module.default
  })
  </script>
  
  <style scoped>
  pre {
    background: #f8f8f8;
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
  }
  </style>