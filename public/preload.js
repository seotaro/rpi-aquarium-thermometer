const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  getDeviceConfig: () => ipcRenderer.invoke('get-device-config-channel'),

  handleUpdateSensorValues: (callback) => {
    ipcRenderer.on('update-sensor-values-channel', callback);
    return () => ipcRenderer.removeAllListeners('update-sensor-values-channel');
  },

  loadSensorValues: (span) => ipcRenderer.invoke('load-sensor-values-channel', span)
})

