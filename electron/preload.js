import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getGameState: () => ipcRenderer.invoke('get-game-state'),
  captureScreen: (region) => ipcRenderer.invoke('capture-screen', region),
  runOCR: (region) => ipcRenderer.invoke('run-ocr', region),
  testRegionOCR: (region) => ipcRenderer.invoke('test-region-ocr', region),
});
