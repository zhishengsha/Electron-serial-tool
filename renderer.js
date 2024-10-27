//刷新串口
document.getElementById('refreshPortsButton').addEventListener('click', async () => {
  console.log('Hello from Electron 👋');
  const ports = await window.serialAPI.listSerialPorts();
  const dropdown = document.getElementById('serial-port-select');
  dropdown.innerHTML = ''; // 清空旧选项
  ports.forEach(port => {
    const option = document.createElement('option');
    option.value = port;
    option.textContent = port;
    dropdown.appendChild(option);
  });

});
//打开串口
document.getElementById('openPortButton').addEventListener('click', async () => {
    const portPath = document.getElementById('serial-port-select').value;
    const baudRate = parseInt(document.getElementById('serial-baud').value);
    console.log(baudRate);
    try {
      const message = await window.serialAPI.openSerialPort(portPath,baudRate);
      console.log(message);
    } catch (error) {
      console.error(error);
    }
  });

//关闭串口
document.getElementById('closePortButton').addEventListener('click', async () => {
    const message = await window.serialAPI.closeSerialPort();
    console.log(message);
  });
  
// 接收串口数据
window.serialAPI.onSerialPortData((data) => {
    console.log("data coming");
    const receivedDataContainer = document.getElementById('receivedData');
    receivedDataContainer.textContent += `\n${data}`;
  });

//发送串口数据
document.getElementById('send-button').addEventListener('click', () => {
    const data = document.getElementById('dataInput').value;
    console.log('Send data:', data);
    window.serialAPI.writeToSerialPort(data);
  });

  
