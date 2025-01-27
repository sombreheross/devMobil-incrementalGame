<template>
  <div class="auth-container">
    <!-- Écran de chargement -->
    <div v-if="isWakingUp" class="loading-screen">
      <div class="loading-spinner"></div>
      <p>Connexion au serveur en cours...</p>
    </div>

    <!-- Contenu existant (à masquer pendant le chargement) -->
    <div v-else class="auth-box">
      <h1 class="welcome-text">Welcome to Watt's Left ?</h1>
      <div class="auth-tabs">
        <button 
          :class="{ active: mode === 'login' }" 
          @click="mode = 'login'"
        >
          Se connecter
        </button>
        <button 
          :class="{ active: mode === 'register' }" 
          @click="mode = 'register'"
        >
          Créer un compte
        </button>
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="username">Nom d'utilisateur</label>
          <input 
            type="text" 
            id="username" 
            v-model="formData.username" 
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Mot de passe</label>
          <input 
            type="password" 
            id="password" 
            v-model="formData.password" 
            required
          />
        </div>

        <div v-if="mode === 'register'" class="form-group">
          <label for="confirmPassword">Confirmer mot de passe</label>
          <input 
            type="password" 
            id="confirmPassword" 
            v-model="formData.confirmPassword" 
            required
          />
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <button type="submit" class="submit-btn">
          {{ mode === 'login' ? 'Se connecter' : 'Créer un compte' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useFetchApi } from '../composables/useFetchApi';
import { useRouter } from 'vue-router';

const { fetchApi, setAuthHeader } = useFetchApi();
const mode = ref('login');
const error = ref('');
const router = useRouter();
const isWakingUp = ref(true);

const formData = reactive({
  username: '',
  password: '',
  confirmPassword: ''
});

const configureAuthHeader = (token) => {
  localStorage.setItem('token', token);
  setAuthHeader(token);
};

const handleSubmit = async () => {
  error.value = '';
  
  try {
    if (mode.value === 'register') {
      if (formData.password !== formData.confirmPassword) {
        error.value = 'Les mots de passe ne correspondent pas';
        return;
      }
      
      // 1. Inscription
      const registerResponse = await fetchApi({
        url: '/users/register',
        method: 'POST',
        data: {
          username: formData.username,
          password: formData.password
        }
      });

      // 2. Connexion immédiate pour obtenir le token
      const loginResponse = await fetchApi({
        url: '/users/login',
        method: 'POST',
        data: {
          username: formData.username,
          password: formData.password
        }
      });
      
      configureAuthHeader(loginResponse.token);

      // 3. Initialisation des ressources
      await fetchApi({
        url: '/resources/init',
        method: 'POST'
      });

      // 4. Ajout de 10 gold (id: 1)
      await fetchApi({
        url: '/resources/1/resource',
        method: 'PATCH',
        data: {
          amount: 10
        }
      });

      // 5. Achat de la première upgrade
      await fetchApi({
        url: '/upgrades/1/buy',
        method: 'POST'
      });

      // 6. Redirection vers le jeu
      router.push('/game');
    } else {
      const response = await fetchApi({
        url: '/users/login',
        method: 'POST',
        data: {
          username: formData.username,
          password: formData.password
        }
      });
      
      configureAuthHeader(response.token);
      formData.username = '';
      formData.password = '';
      router.push('/game');
    }
  } catch (err) {
    error.value = err.data?.message || 'Erreur de connexion au serveur';
  }
};

const wakeUpServer = async () => {
  try {
    await fetchApi({
      url: '',
      method: 'GET',
      timeout: 300000 // 300 secondes (5 minutes)
    });
  } catch (error) {
    console.error('Erreur lors du réveil de l\'API:', error);
  } finally {
    isWakingUp.value = false;
  }
};

onMounted(() => {
  wakeUpServer();
});
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

.auth-box {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.auth-tabs {
  display: flex;
  margin-bottom: 2rem;
  border-bottom: 1px solid #eee;
}

.auth-tabs button {
  flex: 1;
  padding: 1rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 1.1rem;
  color: #666;
}

.auth-tabs button.active {
  color: #4CAF50;
  border-bottom: 2px solid #4CAF50;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
}

input {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #4CAF50;
}

.error-message {
  color: #f44336;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.submit-btn {
  width: 100%;
  padding: 1rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-btn:hover {
  background-color: #388E3C;
}

.welcome-text {
  text-align: center;
  color: #333;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

/* Nouveaux styles pour l'écran de chargement */
.loading-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #4CAF50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-screen p {
  color: #666;
  font-size: 1.1rem;
  margin: 0;
}
</style> 