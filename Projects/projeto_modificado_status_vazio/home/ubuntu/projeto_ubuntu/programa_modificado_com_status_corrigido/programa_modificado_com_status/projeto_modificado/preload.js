// Preload script para o Electron
// Este arquivo é carregado antes do renderer process

const { contextBridge, ipcRenderer } = require('electron');

// Expor APIs seguras para o renderer process se necessário
contextBridge.exposeInMainWorld('electronAPI', {
    // Adicionar APIs específicas aqui se necessário
});

console.log('Preload script carregado com sucesso');

