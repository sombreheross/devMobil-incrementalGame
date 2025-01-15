import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { setDefaultBaseUrl, setDefaultHeaders } from './composables/useFetchApi';

// Définir l'URL de base
setDefaultBaseUrl('https://archioweb-incrementalgame.onrender.com');

// Ajouter le token d'authentification aux headers par défaut
const token = localStorage.getItem('token');
if (token) {
  setDefaultHeaders({
    'Authorization': `Bearer ${token}`
  });
}

const app = createApp(App);
app.use(router);
app.mount('#app');
