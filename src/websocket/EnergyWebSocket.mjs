import WSServerPubSub from "./WSServerPubSub.mjs";
import WSServerError from "./WSServerError.mjs";

export default class EnergyWebSocket extends WSServerPubSub {
  // Map to track active users and their primary clients
  activeUsers = new Map(); // userId -> primaryClientId

  constructor(options = {}) {
    super({
      ...options,
      authCallback: (token, request, wsServer) => {
        try {
          // Decode and verify JWT token here
          // For now, we'll assume token is the userId
          const userId = token;
          return { userId };
        } catch (error) {
          return false;
        }
      }
    });

    // Add energy update channel
    this.addChannel('energy-update', {
      usersCanPub: true,
      usersCanSub: true,
      hookPub: (msg, client, wsServer) => {
        const userId = wsServer.clients.get(client).userId;
        const primaryClientId = this.activeUsers.get(userId);

        // Only allow primary client to publish updates
        if (client !== primaryClientId) {
          throw new WSServerError('Only primary client can publish updates');
        }

        return msg;
      },
      hookSub: (client, wsServer) => {
        const userId = wsServer.clients.get(client).userId;
        
        // If this is the first client for this user
        if (!this.activeUsers.has(userId)) {
          this.activeUsers.set(userId, client);
          return true;
        }

        // Allow subscription for secondary clients
        return true;
      },
      hookUnsub: (client, wsServer) => {
        const userId = wsServer.clients.get(client).userId;
        const primaryClientId = this.activeUsers.get(userId);

        // If the primary client disconnects, find a new primary client
        if (client === primaryClientId) {
          // Find another client for this user
          for (const [otherClient, metadata] of wsServer.clients.entries()) {
            if (otherClient !== client && metadata.userId === userId) {
              this.activeUsers.set(userId, otherClient);
              // Notify the new primary client
              this.send(otherClient, JSON.stringify({
                action: 'primary-client',
                status: true
              }));
              return;
            }
          }
          // No other clients found, remove user from active users
          this.activeUsers.delete(userId);
        }
      }
    });

    // Add RPC for checking if client is primary
    this.addRpc('isPrimaryClient', (data, client, wsServer) => {
      const userId = wsServer.clients.get(client).userId;
      const primaryClientId = this.activeUsers.get(userId);
      return client === primaryClientId;
    });
  }

  // Helper method to check if a client is primary
  isPrimaryClient(client) {
    const userId = this.clients.get(client).userId;
    return this.activeUsers.get(userId) === client;
  }
} 