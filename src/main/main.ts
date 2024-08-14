/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path'
import {
  app,
  BrowserWindow,
  shell,
  ipcMain,
  dialog,
  Tray,
  nativeImage
} from 'electron'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log'
import MenuBuilder from './menu'
import { resolveHtmlPath } from './util'
import fs from 'fs'
import Store from 'electron-store'
const store = new Store()
class AppUpdater {
  constructor() {
    log.transports.file.level = 'info'
    autoUpdater.logger = log
    autoUpdater.checkForUpdatesAndNotify()
  }
}

let mainWindow: BrowserWindow | null = null

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`
  event.reply('ipc-example', msgTemplate('pong'))
})

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support')
  sourceMapSupport.install()
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true'

if (isDebug) {
  require('electron-debug')()
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer')
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS
  const extensions = ['REACT_DEVELOPER_TOOLS']

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log)
}

const createWindow = async () => {
  if (isDebug) {
    await installExtensions()
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets')

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths)
  }

  mainWindow = new BrowserWindow({
    show: false,
    width: 1500,
    height: 1000,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js')
    }
  })

  mainWindow.loadURL(resolveHtmlPath('index.html'))

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined')
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize()
    } else {
      mainWindow.show()
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  const menuBuilder = new MenuBuilder(mainWindow)
  menuBuilder.buildMenu()

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url)
    return { action: 'deny' }
  })

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater()
}

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// 创建托盘
let tray: any = null
const trayIconOnline = nativeImage.createFromPath('../renderer/assets/logo.png')
const trayIconOffline = nativeImage.createFromPath(
  '../renderer/assets/logo.png'
)
function createTray() {
  tray = new Tray(trayIconOnline)
}

ipcMain.on('network:change', (event, state) => {
  tray.setImage(state ? trayIconOnline : trayIconOffline)
})

app
  .whenReady()
  .then(() => {
    createWindow()
    createTray()
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow()
    })
  })
  .catch(console.log)

// 定义ipcRenderer监听事件
ipcMain.on('store:set-store', (event, key, value) => {
  store.set(key, value)
})

ipcMain.on('store:get-store', (event, key) => {
  event.returnValue = store.get(key)
})

ipcMain.on('setStore', (_, key, value) => {
  store.set(key, value)
})

ipcMain.on('getStore', (_, key) => {
  const value = store.get(key)
  _.returnValue = value || ''
})

// fs 操作
ipcMain.handle('fs:read-file', async (event, filePath) => {
  return await fs.promises.readFile(filePath, 'utf-8')
})

ipcMain.handle('fs:write-file', async (event, { filePath, data }) => {
  return await fs.promises.writeFile(filePath, data, 'utf-8')
})

ipcMain.handle('fs:rename-file', async (event, { filePath, newFilePath }) => {
  return await fs.promises.rename(filePath, newFilePath)
})

ipcMain.handle('fs:delete-file', async (event, filePath) => {
  return await fs.promises.unlink(filePath)
})

// 本地文件相对路径
ipcMain.handle('read-user-data', async (event, fileName) => {
  const filePath = app.getAppPath()
  const buf = await fs.promises.readFile(`${filePath}/${fileName}`)
  return buf
})

ipcMain.handle('path:get-app-path', () => {
  const filePath = app.getAppPath()
  return filePath
})

ipcMain.handle('path:join-path', (event, fileName) => {
  // join-path 文件生成的地址
  return path.resolve(__dirname, '../../', `${fileName}.md`)
})
ipcMain.handle('path:join-other-path', (event, { filePath, fileName }) => {
  return path.join(path.dirname(filePath), `${fileName}.md`)
})

// 导入
ipcMain.handle('dialog:open-dialog', async (event, options) => {
  const win = BrowserWindow.fromWebContents(
    event.sender
  ) as Electron.BrowserWindow
  return await dialog.showOpenDialog(win, options)
})

ipcMain.handle('dialog:save-dialog', async (event, options) => {
  const win = BrowserWindow.fromWebContents(
    event.sender
  ) as Electron.BrowserWindow
  return await dialog.showSaveDialog(win, options)
})

ipcMain.handle('dialog:message-box', async (event, options) => {
  const win = BrowserWindow.fromWebContents(
    event.sender
  ) as Electron.BrowserWindow
  return await dialog.showMessageBox(win, options)
})

ipcMain.on('dialog:error-box', (event, options) => {
  const { title, content } = options
  dialog.showErrorBox(title, content)
})

ipcMain.on('setStore', (_, key, value) => {
  store.set(key, value)
})

ipcMain.on('getStore', (_, key) => {
  const value = store.get(key)
  _.returnValue = value || ''
})
