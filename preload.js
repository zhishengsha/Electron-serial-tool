const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('serialAPI', {
  listSerialPorts: () => ipcRenderer.invoke('list-serial-ports'),
  openSerialPort: (portPath,baudRate) => ipcRenderer.invoke('open-serial-port', portPath,baudRate),
  closeSerialPort: () => ipcRenderer.invoke('close-serial-port'),
  writeToSerialPort: (data) => ipcRenderer.send('write-to-serial-port', data),
  onSerialPortData: (callback) => ipcRenderer.on('serial-port-data', (event, data) => callback(data)),
});
