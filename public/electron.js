const { app, globalShortcut, BrowserWindow, ipcMain } = require('electron');
const isDev = require('electron-is-dev');
const fs = require('fs');
const path = require('path');

const database = require('./database');
const client = new database({});
client.initialize();

// config 読み込み
const CONFIG = (() => {
  let ret = {
    READ_SENSOR_INTERVAL: 10000,        // センサーの読み取り間隔 [ms]
    DELETE_DATABASE_INTERVAL: 3600000,  // データベースを削除する間隔 [ms]
    DUMMY_SENSOR: '',
    DS18B20: 'on',
    DEVICES: {
      'id': 'name'
    },
  };

  const configPath = path.join(app.getPath('userData'), 'config.json');
  console.log('config path', configPath);
  try {
    ret = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  } catch (err) {
    if (err.code === 'ENOENT') {
      // config.json がなければ作る
      fs.writeFile(configPath, JSON.stringify(ret, null, 4), 'utf8', (err) => {
        if (err) {
          console.error(`create config.json failed: ${err}`);
        } else {
          console.log('create config.json');
        }
      });
    } else {
      console.error(`load config.json failed: ${err} `);
    }
  }
  return ret;
})();
console.log('config', CONFIG);

// センサー初期化
let sensors = [];
if (CONFIG.DS18B20 && (CONFIG.DS18B20 === 'on')) {
  const sensor = require('./DS18B20');
  sensors.push(sensor);
}
if (CONFIG.DUMMY_SENSOR && (CONFIG.DUMMY_SENSOR === 'on')) {
  const sensor = require('./dummy-sensor');
  sensors.push(sensor);
}
for (const sensor of sensors) {
  sensor.initialize()
    .then(() => {
      console.log(`${sensor.name()}: initialization succeeded`);
    })
    .catch(err => console.error(`${sensor.name()}: initialization failed: ${err} `));
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    fullscreen: true,
    kiosk: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  mainWindow.loadURL(isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../build/index.html')}`);

  // センサー読み取り
  setInterval(() => {
    for (const sensor of sensors) {
      sensor.read()
        .then(records => {
          console.log(`${sensor.name()}: read\n`, records, '\n');

          mainWindow.webContents.send('update-sensor-values-channel', records);
          return client.insert(records);
        })
        .catch(err => {
          console.log(`${sensor.name()}: read error ${err}`);
        });
    }
  }, CONFIG.READ_SENSOR_INTERVAL);

  // 古いレコードを削除する
  setInterval(() => {
    client.delete(24 * 60 * 60)
      .then(() => {
        console.log(`delete records`);
      })
      .catch(err => {
        console.log(`delete records error ${err}`);
      });
  }, CONFIG.DELETE_DATABASE_INTERVAL);

  globalShortcut.register('ctrl+q', function () {
    mainWindow.close();
    app.quit();
  });

  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  ipcMain.handle('get-device-config-channel', () => CONFIG.DEVICES);

  ipcMain.handle('load-sensor-values-channel', async (event, span) => {
    return await client.select(span);
  });

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

