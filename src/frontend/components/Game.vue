<template>
  <div class="game-container">
    <button class="logout-button" @click="handleLogout">
      <i class="fas fa-sign-out-alt"></i>
    </button>
    <div class="tab-slider">
      <div class="tab-slider-wrapper">
        <button 
          :class="{ active: currentTab === 'production' }" 
          @click="currentTab = 'production'"
        >
          <i class="fas fa-bolt"></i>
          Production
        </button>
        <button 
          :class="{ active: currentTab === 'shop' }" 
          @click="currentTab = 'shop'"
        >
          <i class="fas fa-money-bill"></i>
          Boutique
        </button>
        <div class="slider-background" :class="currentTab"></div>
      </div>
    </div>

    <section class="storage">
      <h2>Stockage</h2>
      <div class="storage-info">
        <p>Stock d'énergie : {{ energy.toFixed(2) }} u</p>
        <p>Rendement : {{ displayYield }}</p>
        <p>Coffre-fort : {{ money }}$</p>
        <p class="location">
          Localisation : {{ location === 'indoor' ? 'Intérieur' : 'Extérieur' }}
          <button 
            class="location-toggle" 
            @click="detectLocation"
            :disabled="isLocating"
          >
            <i class="fas" :class="[
              isLocating ? 'fa-spinner fa-spin' : location === 'indoor' ? 'fa-door-open' : 'fa-door-closed'
            ]"></i>
            <span>Me localiser</span>
          </button>
        </p>
        <p v-if="dynamoTimeLeft" class="dynamo">
          Dynamo active : {{ formatDynamoTime }}
        </p>
      </div>
    </section>

    <div v-if="currentTab === 'production'" class="production-tab">
      <section class="generators">
        <h2>Production énergétique</h2>
        <div class="generator-list">
          <div v-for="(upgradeList, generator) in generators" :key="generator" class="generator-item">
            <span class="generator-name">{{ formatGeneratorName(generator) }} :</span>
            <span class="generator-count">{{ upgradeList.length }}</span>
          </div>
        </div>
      </section>
    </div>

    <div v-else class="shop-tab">
      <section class="sale">
        <h2>Vente</h2>
        <div class="sale-info">
          <p>Prix de vente : 10u pour 1$</p>
          <div class="sale-action">
            <select v-model="saleAmount" class="amount-select">
              <option 
                v-for="amount in [10, 20, 50, 100, 500, 1000, 5000, 10000, 50000, 100000, 500000, 1000000, 5000000, 10000000, 25000000, 50000000]" 
                :key="amount"
                :value="amount"
                :disabled="amount > energy"
              >
                {{ amount.toLocaleString() }}u
              </option>
            </select>
            <button 
              class="sell-button" 
              :disabled="!saleAmount || saleAmount > energy"
              @click="handleSale"
            >
              Vendre
            </button>
          </div>
        </div>
      </section>

      <section class="purchase">
        <h2>Achat</h2>
        <div class="generator-shop-list">
          <div v-for="upgrade in availableUpgrades" :key="upgrade.id" class="shop-item">
            <span class="generator-name">{{ upgrade.name }}</span>
            <button 
              class="price-button" 
              :disabled="upgrade.price > money"
              @click="handlePurchase(upgrade)"
            >
              {{ upgrade.price }}$
            </button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, onBeforeUnmount, computed } from 'vue';
import { useFetchApiCrud } from '../composables/useFetchApiCrud';
import { useFetchApi } from '../composables/useFetchApi';
import { useRouter } from 'vue-router';

const currentTab = ref('production');
const energy = ref(0);
const energyYield = ref(0);
const money = ref(0);
const goldResourceId = '1';
const energyResourceId = '2';
const location = ref('indoor');
const isLocating = ref(false);

const generators = reactive({
  smallWindmill: [],      // Petite batterie
  mediumWindmill: [],     // Éoliennes Moyennes 1-4
  largeWindmill: [],      // Grandes Éoliennes 1-5
  tools: [],             // Outils de construction
  smallSolarPanel: [],    // Petit panneau solaire
  mediumSolarPanel: [],   // Panneaux solaires moyens 1-4
  largeSolarPanel: [],    // Grands panneaux solaires 1-5
  riverAccess: [],       // Terrain avec accès à la rivière
  dam: [],              // Barrage
  turbines: [],         // Turbines 1-4
  damWindmill: [],      // Éoliennes sur le barrage 1-3
  windFarmLand: [],     // Terrain pour parc éolien
  windFarm: [],         // Parc éolien
  solarFarmLand: [],    // Terrain pour champ solaire
  solarFarm: [],        // Champ solaire
  cityLand: [],         // Terrain en lisière de la ville
  biomass: [],          // Stations de biomasse 1-3
  city: []              // Achat de la ville
});

const saleAmount = ref(10);
const lastSaleAmount = ref(10);
const shopGenerators = reactive({
  smallWindmill: 6349,
  mediumWindmill: 6349,
  largeWindmill: 6349,
  smallSolarPanel: 6349,
  mediumSolarPanel: 6349,
  largeSolarPanel: 6349,
  dam: 6349,
  turbines: 6349
});

const shakeThreshold = 15;
const shakeStartTime = ref(null);
const dynamoTimeLeft = ref(0);
let dynamoInterval = null;
let shakeHandler = null;

const formatGeneratorName = (key) => {
  const names = {
    smallWindmill: 'Petite batterie',
    mediumWindmill: 'Éolienne Moyenne',
    largeWindmill: 'Grande Éolienne',
    tools: 'Outils de construction',
    smallSolarPanel: 'Petit panneau solaire',
    mediumSolarPanel: 'Panneau solaire moyen',
    largeSolarPanel: 'Grand panneau solaire',
    riverAccess: 'Terrain avec accès à la rivière',
    dam: 'Barrage',
    turbines: 'Turbine',
    damWindmill: 'Éoliennes sur le barrage',
    windFarmLand: 'Terrain pour parc éolien',
    windFarm: 'Parc éolien',
    solarFarmLand: 'Terrain pour champ solaire',
    solarFarm: 'Champ solaire',
    cityLand: 'Terrain en lisière de la ville',
    biomass: 'Station de production de biomasse',
    city: 'Ville'
  };
  return names[key] || key;
};

const mapUpgradeToGenerator = (upgradeName) => {
  if (upgradeName.includes('Petite batterie')) return 'smallWindmill';
  if (upgradeName.includes('Éolienne Moyenne')) return 'mediumWindmill';
  if (upgradeName.includes('Grande Éolienne')) return 'largeWindmill';
  if (upgradeName.includes('Outils de construction')) return 'tools';
  if (upgradeName.includes('Petit panneau solaire')) return 'smallSolarPanel';
  if (upgradeName.includes('Panneau solaire moyen')) return 'mediumSolarPanel';
  if (upgradeName.includes('Grand panneau solaire')) return 'largeSolarPanel';
  if (upgradeName.includes('Terrain avec accès à la rivière')) return 'riverAccess';
  if (upgradeName === 'Barrage') return 'dam';
  if (upgradeName.includes('Turbine')) return 'turbines';
  if (upgradeName.includes('Éoliennes sur le barrage')) return 'damWindmill';
  if (upgradeName.includes('Terrain pour parc éolien')) return 'windFarmLand';
  if (upgradeName === 'Parc éolien') return 'windFarm';
  if (upgradeName.includes('Terrain pour champ solaire')) return 'solarFarmLand';
  if (upgradeName === 'Champ solaire') return 'solarFarm';
  if (upgradeName.includes('Terrain en lisière')) return 'cityLand';
  if (upgradeName.includes('Station de production de biomasse')) return 'biomass';
  if (upgradeName.includes('Achat de la ville')) return 'city';
  return null;
};

const { read: readResources, update: updateResources } = useFetchApiCrud('resources');
const { read: readUpgrades, create: createUpgrade } = useFetchApiCrud('upgrades');
const { fetchApi } = useFetchApi();

const router = useRouter();

const fetchGenerators = async () => {
  console.log('Début fetchGenerators');
  const { data, error, loading } = readUpgrades('?limit=0&owned=true');
  
  watch(loading, (newLoading) => {
    if (!newLoading) {
      if (data.value) {
        // Reset all arrays
        Object.keys(generators).forEach(key => generators[key] = []);
        
        // Reset yield
        energyYield.value = 0;
        
        // Populate arrays with upgrades and calculate total yield
        data.value.upgrades.forEach(upgrade => {
          const generatorKey = mapUpgradeToGenerator(upgrade.name);
          if (generatorKey) {
            generators[generatorKey].push(upgrade);
            energyYield.value += upgrade.production;
          }
        });
      } else if (error.value) {
        console.error('Erreur lors de la récupération des générateurs:', error.value);
      }
    }
  }, { immediate: true });
};

const fetchGoldAmount = () => {
  console.log('Début fetchGoldAmount');
  const { data, error, loading } = readResources(`${goldResourceId}/resource`);
  
  watch(loading, (newLoading) => {
    if (!newLoading) {
      if (data.value) {
        console.log('Amount trouvé:', data.value.amount);
        money.value = data.value.amount;
        console.log('money.value après assignation:', money.value);
      } else if (error.value) {
        console.error('Erreur lors de la récupération du gold:', error.value);
      }
    }
  }, { immediate: true });
};

const fetchEnergyAmount = () => {
  console.log('Début fetchEnergyAmount');
  const { data, error, loading } = readResources(`${energyResourceId}/resource`);
  
  watch(loading, (newLoading) => {
    if (!newLoading) {
      if (data.value) {
        console.log('Amount trouvé:', data.value.amount);
        energy.value = data.value.amount;
        console.log('energy.value après assignation:', energy.value);
      } else if (error.value) {
        console.error('Erreur lors de la récupération de l\'énergie:', error.value);
      }
    }
  }, { immediate: true });
};

let isSelling = false;  // Flag pour indiquer une vente en cours

const handleSale = async () => {
  if (!saleAmount.value || saleAmount.value > energy.value) return;
  
  try {
    isSelling = true;
    lastSaleAmount.value = saleAmount.value;
    
    const { data, error, loading } = updateResources(`${energyResourceId}/resource`, {
      amount: energy.value - saleAmount.value
    });

    watch(loading, (newLoading) => {
      if (!newLoading) {
        if (data.value) {
          // On utilise directement la valeur du serveur
          energy.value = data.value.amount;
          
          const moneyEarned = saleAmount.value / 10;
          const { data: moneyData, error: moneyError, loading: moneyLoading } = updateResources(`${goldResourceId}/resource`, {
            amount: money.value + moneyEarned
          });

          watch(moneyLoading, (newMoneyLoading) => {
            if (!newMoneyLoading) {
              if (moneyData.value) {
                money.value = moneyData.value.amount;
                saleAmount.value = lastSaleAmount.value;
              } else if (moneyError.value) {
                console.error('Erreur lors de la mise à jour de l\'argent:', moneyError.value);
              }
              isSelling = false;
            }
          });

        } else if (error.value) {
          console.error('Erreur lors de la mise à jour de l\'énergie:', error.value);
          isSelling = false;  // Fin de la vente en cas d'erreur
        }
      }
    });
    
  } catch (err) {
    console.error('Erreur lors de la vente:', err);
    isSelling = false;  // Fin de la vente en cas d'erreur
  }
};

let productionInterval;
let syncInterval;

const syncWithServer = async () => {
  // Ne pas synchroniser pendant une vente
  if (isSelling) return;

  const { data, error, loading } = updateResources(`${energyResourceId}/resource`, {
    amount: energy.value
  });

  watch(loading, (newLoading) => {
    if (!newLoading) {
      if (data.value) {
        energy.value = data.value.amount;
      } else if (error.value) {
        console.error('Erreur lors de la synchronisation:', error.value);
        fetchEnergyAmount();
      }
    }
  });
};

const handleShake = (event) => {
  const acceleration = event.accelerationIncludingGravity;
  if (!acceleration) return;

  const movement = Math.sqrt(
    Math.pow(acceleration.x, 2) +
    Math.pow(acceleration.y, 2) +
    Math.pow(acceleration.z, 2)
  );

  if (movement > shakeThreshold) {
    if (!shakeStartTime.value) {
      shakeStartTime.value = Date.now();
    }
  } else if (shakeStartTime.value) {
    const shakeDuration = (Date.now() - shakeStartTime.value) / 1000; // en secondes
    if (shakeDuration >= 1) { // minimum 1 seconde de secouage
      startDynamo(shakeDuration * 3); // durée x3
    }
    shakeStartTime.value = null;
  }
};

const startDynamo = async (duration) => {
  try {
    await fetchApi({
      url: '/users/dynamo',
      method: 'PATCH',
      data: { dynamo: true }
    });
    
    dynamoTimeLeft.value = Math.floor(duration);
    
    if (dynamoInterval) {
      clearInterval(dynamoInterval);
    }
    
    dynamoInterval = setInterval(() => {
      dynamoTimeLeft.value--;
      if (dynamoTimeLeft.value <= 0) {
        stopDynamo();
      }
    }, 1000);
  } catch (error) {
    console.error('Erreur lors du démarrage de la dynamo:', error);
  }
};

const stopDynamo = async () => {
  if (dynamoInterval) {
    clearInterval(dynamoInterval);
    dynamoInterval = null;
  }
  dynamoTimeLeft.value = 0;
  
  try {
    await fetchApi({
      url: '/users/dynamo',
      method: 'PATCH',
      data: { dynamo: false }
    });
  } catch (error) {
    console.error('Erreur lors de l\'arrêt de la dynamo:', error);
  }
};

const formatDynamoTime = computed(() => {
  const minutes = Math.floor(dynamoTimeLeft.value / 60);
  const seconds = dynamoTimeLeft.value % 60;
  return `${minutes}m ${seconds}s`;
});

const displayYield = computed(() => {
  let baseYield = energyYield.value;
  let bonuses = [];
  
  if (location.value === 'outdoor') {
    baseYield *= 1.1;
    bonuses.push('extérieur +10%');
  }
  
  if (dynamoTimeLeft.value > 0) {
    baseYield *= 2;
    bonuses.push('dynamo +100%');
  }
  
  return bonuses.length > 0 
    ? `${baseYield.toFixed(1)} u/s (${bonuses.join(', ')})`
    : `${baseYield} u/s`;
});

const startProduction = () => {
  // Production locale chaque seconde
  productionInterval = setInterval(() => {
    const productionAmount = location.value === 'outdoor' 
      ? energyYield.value * 1.1 
      : energyYield.value;
    energy.value += productionAmount;
  }, 1000);

  // Synchronisation avec le serveur toutes les 10 secondes
  syncInterval = setInterval(syncWithServer, 10000);
};

const availableUpgrades = ref([]);

const fetchAvailableUpgrades = async () => {
  const { data, error, loading } = readUpgrades('next');
  
  watch(loading, (newLoading) => {
    if (!newLoading) {
      if (data.value) {
        availableUpgrades.value = [
          data.value.nextAvailable,
          data.value.nextLocked
        ].filter(Boolean); // Filtre les valeurs null
      } else if (error.value) {
        console.error('Erreur lors de la récupération des upgrades disponibles:', error.value);
      }
    }
  }, { immediate: true });
};

const handlePurchase = async (upgrade) => {
  if (money.value < upgrade.price) return;
  
  try {
    // 1. Mettre à jour l'argent
    const { data: moneyData, error: moneyError, loading: moneyLoading } = updateResources(`${goldResourceId}/resource`, {
      amount: money.value - upgrade.price
    });

    watch(moneyLoading, async (newMoneyLoading) => {
      if (!newMoneyLoading) {
        if (moneyData.value) {
          money.value = moneyData.value.amount;

          try {
            // 2. Acheter l'upgrade avec fetchApi
            await fetchApi({
              url: `/upgrades/${upgrade.id}/buy`,
              method: 'POST'
            });
            
            // 3. Mettre à jour la liste des générateurs
            await fetchGenerators();
            
            // 4. Mettre à jour la liste des upgrades disponibles
            await fetchAvailableUpgrades();
          } catch (buyError) {
            console.error('Erreur lors de l\'achat de l\'upgrade:', buyError);
          }
        } else if (moneyError.value) {
          console.error('Erreur lors de la mise à jour de l\'argent:', moneyError.value);
        }
      }
    });
  } catch (err) {
    console.error('Erreur lors de l\'achat:', err);
  }
};

const handleLogout = async () => {
  // Arrêter les intervalles de production
  clearInterval(productionInterval);
  clearInterval(syncInterval);
  
  // Dernière synchronisation avec le serveur
  await syncWithServer();
  
  // Supprimer le token
  localStorage.removeItem('token');
  
  // Rediriger vers la page d'authentification (correction de la casse)
  router.push('/login');
};

const isUserInsideBuilding = async (lat, lon) => {
  const overpassUrl = "https://overpass-api.de/api/interpreter";
  const query = `
    [out:json];
    (
      is_in(${lat},${lon});
    );
    way._[building];
    out;
  `;

  try {
    const response = await fetch(overpassUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: query,
    });

    if (!response.ok) {
      console.error("Erreur API Overpass:", response.statusText);
      return false;
    }

    const data = await response.json();
    return data.elements && data.elements.length > 0;
  } catch (error) {
    console.error("Erreur de connexion ou de traitement :", error);
    return false;
  }
};

const detectLocation = async () => {
  if (!navigator.geolocation) {
    console.error("La géolocalisation n'est pas supportée par ce navigateur.");
    return;
  }

  isLocating.value = true;
  
  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });

    const { latitude, longitude } = position.coords;
    console.log('Coordonnées récupérées:', { latitude, longitude });

    const isInside = await isUserInsideBuilding(latitude, longitude);
    location.value = isInside ? 'indoor' : 'outdoor';

    // Envoyer les coordonnées à l'API
    try {
      const payload = {
        longitude: Number(longitude),
        latitude: Number(latitude)
      };
      
      console.log('Envoi à l\'API - Payload:', payload);
      console.log('Type de longitude:', typeof payload.longitude);
      console.log('Type de latitude:', typeof payload.latitude);

      const response = await fetchApi({
        url: '/users/position',
        method: 'PATCH',
        data: payload
      });
      
      console.log('Réponse de l\'API:', response);

    } catch (error) {
      console.error("Erreur lors de l'envoi des coordonnées à l'API:", error);
      if (error.response) {
        console.error('Détails de l\'erreur:', await error.response.json());
      }
    }

  } catch (error) {
    console.error("Erreur de géolocalisation:", error);
  } finally {
    isLocating.value = false;
  }
};

const requestDeviceMotionPermission = async () => {
  try {
    // Pour iOS 13+
    if (typeof DeviceMotionEvent !== 'undefined' && 
        typeof DeviceMotionEvent.requestPermission === 'function') {
      const permissionState = await DeviceMotionEvent.requestPermission();
      
      if (permissionState === 'granted') {
        window.addEventListener('devicemotion', shakeHandler);
      } else {
        console.error('Permission refusée pour l\'accéléromètre');
      }
    } 
    // Pour Android et autres
    else if (window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', shakeHandler);
    } else {
      console.error('L\'accéléromètre n\'est pas supporté sur cet appareil');
    }
  } catch (error) {
    console.error('Erreur lors de la demande de permission:', error);
  }
};

onMounted(() => {
  fetchGoldAmount();
  fetchEnergyAmount();
  fetchGenerators();
  fetchAvailableUpgrades();
  startProduction();
  
  requestDeviceMotionPermission();
});

onBeforeUnmount(() => {
  clearInterval(productionInterval);
  clearInterval(syncInterval);
  
  if (shakeHandler) {
    window.removeEventListener('devicemotion', shakeHandler);
  }
  if (dynamoInterval) {
    clearInterval(dynamoInterval);
  }
});
</script>

<style scoped>
.game-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

.tab-slider {
  position: fixed;
  bottom: 50px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
}

.tab-slider-wrapper {
  position: relative;
  display: flex;
  background: rgba(238, 238, 238, 0.9);
  padding: 5px;
  border-radius: 30px;
  gap: 5px;
}

.tab-slider-wrapper button {
  position: relative;
  z-index: 2;
  padding: 10px 25px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 1rem;
  color: #666;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: color 0.3s;
}

.tab-slider-wrapper button.active {
  color: white;
}

.slider-background {
  position: absolute;
  top: 5px;
  height: calc(100% - 10px);
  width: calc(50% - 5px);
  background: #2196f3;
  border-radius: 25px;
  transition: transform 0.3s ease;
}

.slider-background.shop {
  transform: translateX(calc(100% + 5px));
}

.tab-slider-wrapper button i {
  font-size: 1.1rem;
}

section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

h2 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
}

.storage-info p {
  margin: 10px 0;
  font-size: 1.1rem;
}

.generator-list {
  display: grid;
  gap: 10px;
}

.generator-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.generator-item:last-child {
  border-bottom: none;
}

.generator-name {
  color: #666;
}

.generator-count {
  font-weight: bold;
  color: #333;
}

.sale-info {
  margin-bottom: 20px;
}

.sale-action {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.amount-select {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
}

.sell-button {
  padding: 8px 20px;
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
}

.sell-button:hover {
  background: #1976d2;
}

.generator-shop-list {
  display: grid;
  gap: 15px;
}

.shop-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.shop-item:last-child {
  border-bottom: none;
}

.price-button {
  padding: 8px 16px;
  background: #eee;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
}

.price-button:hover {
  background: #e0e0e0;
}

.amount-select option:disabled {
  color: #999;
  background-color: #f5f5f5;
}

.sell-button:disabled {
  background: #cccccc;
  cursor: not-allowed;
  opacity: 0.7;
}

.logout-button {
  position: absolute;
  top: 20px;
  right: 20px;
  padding: 10px;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.logout-button:hover {
  background: #d32f2f;
}

.location {
  display: flex;
  align-items: center;
  gap: 10px;
}

.location-toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px 10px;
  color: #2196f3;
  transition: color 0.2s;
  display: flex;
  align-items: center;
  gap: 5px;
}

.location-toggle span {
  font-size: 0.9rem;
}

.location-toggle:hover {
  color: #1976d2;
}

.location-toggle:disabled {
  cursor: wait;
  opacity: 0.7;
}

.dynamo {
  color: #2196f3;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>