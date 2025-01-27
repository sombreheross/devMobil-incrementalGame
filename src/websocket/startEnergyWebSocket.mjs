import EnergyWebSocket from './EnergyWebSocket.mjs';

const startEnergyWebSocket = (options = {}) => {
  const wsServer = new EnergyWebSocket({
    port: process.env.WS_PORT || 8887,
    maxNbOfClients: 1000,
    verbose: true,
    origins: process.env.NODE_ENV === 'production' 
      ? ['https://devmobil-incrementalgame.onrender.com']
      : ['http://localhost:5173'],
    ...options
  });

  wsServer.start();
  console.log(`WebSocket server started on port ${process.env.WS_PORT || 8887}`);
  
  return wsServer;
};

// Execute the server when this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startEnergyWebSocket();
}

export default startEnergyWebSocket; 