import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getGameState: () => ipcRenderer.invoke('get-game-state'),
  // Add more API methods as we build out functionality
});
