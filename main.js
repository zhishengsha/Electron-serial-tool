// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path')
const SerialPort = require('serialport');
const iconv = require('iconv-lite');

let port; // 串口实例
let mainWindow; // 窗口实例

function createWindow () {
  //创建窗口函数
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  //加载网页
  mainWindow.loadFile('index.html')

  // 加载完成后开启 DevTools
  mainWindow.webContents.once('did-finish-load', () => {
    mainWindow.show(); // 显示窗口
    mainWindow.webContents.openDevTools(); // 开启 DevTools
  });
}

//创建窗口
app.whenReady().then(() => {
  createWindow()
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

//关闭窗口
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})


// 列出串口
ipcMain.handle('list-serial-ports', async () => {
    try {
        const ports = await SerialPort.SerialPort.list();//获取可用串口列表
        return ports.map(port => port.path);
      } catch (error) {
        console.error('Error listing serial ports:', error);
        return [];
      }
});

app.on('ready', () => {
//创建串口类并进行开关
ipcMain.handle('open-serial-port', async (event,portPath,baudRate) => {
    // if (port && port.isOpen) {
    //     // 如果串口已打开，关闭串口
    //     return new Promise((resolve, reject) => {
    //         port.close((error) => {
    //             if (error) {
    //                 reject(`Error closing port: ${error.message}`);
    //             } else {
    //                 port = null; // 关闭后重置串口实例
    //                 resolve('Port closed');
    //             }
    //         });
    //     });
    // } else {
        port = new SerialPort.SerialPort({
            path: portPath,
            baudRate: baudRate,
            // dataBits: dataBit,
            // stopBits: stopBit,
            // parity: parityBit,
            autoOpen: false,
            // rtscts: false,
            // xon: false,
            // xoff: false,
            // xany: false,
            // hupcl: false,
        });
        return new Promise((resolve, reject) => {
            port.open((error) => {
                if (error) {
                    reject(`Error opening port: ${error.message}`);
                } else {
                    resolve(`Port ${portPath} opened at ${baudRate} baud rate.`);

                        // 接收串口数据并转发给渲染进程
                        port.on('data', (data) => {
                            // 处理接收到的数据
                            const receivedData = iconv.decode(data, 'gbk');
                            console.log('Received data:', receivedData);
                            if (mainWindow) { // 确保窗口存在
                                mainWindow.webContents.send('serial-port-data', receivedData);
                            }
                            else
                            {
                                console.log('no mainWindow');
                            }
                        });
                    
                }
            });
        });
    // }

});
});
// 监听串口数据
ipcMain.on('write-to-serial-port', (event, data) => {
    if (port && port.isOpen) {
      console.log('writed data:', data);
      port.write(data, (error) => {
        if (error) {
          console.error('Error writing to port:', error.message);
        }
      });
        // 发送换行符
        port.write('\n'); // 或者
        port.write('\r\n');

    }
  });

// 关闭串口的处理
ipcMain.handle('close-serial-port', async () => {
    if (port && port.isOpen) {
        return new Promise((resolve, reject) => {
            port.close((error) => {
                if (error) {
                    reject(`Error closing port: ${error.message}`);
                } else {
                    port = null; // 关闭后重置串口实例
                    resolve('Port closed');
                }
            });
        });
    } else {
        return 'Port is not open';
    }
});






