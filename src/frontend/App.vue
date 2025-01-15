<template>
  <router-view></router-view>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const isAuthenticated = ref(false);

onMounted(() => {
  // Vérifier si un token existe au chargement
  const token = localStorage.getItem('token');
  isAuthenticated.value = !!token;
});
</script>

<style>
body {
  margin: 0;
  padding: 0;
}

canvas {
  display: block;
  width: 100vw;
  height: 100vh;
  background: white;
}
</style> 