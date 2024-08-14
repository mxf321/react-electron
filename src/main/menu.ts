import {
  app,
  Menu,
  shell,
  BrowserWindow,
  MenuItemConstructorOptions,
  nativeTheme,
  nativeImage,
  Notification
} from 'electron'

interface DarwinMenuItemConstructorOptions extends MenuItemConstructorOptions {
  selector?: string
  submenu?: DarwinMenuItemConstructorOptions[] | Menu
}

export default class MenuBuilder {
  mainWindow: BrowserWindow

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow
  }

  buildMenu(): Menu {
    if (
      process.env.NODE_ENV === 'development' ||
      process.env.DEBUG_PROD === 'true'
    ) {
      this.setupDevelopmentEnvironment()
    }

    const template: any =
      process.platform === 'darwin'
        ? this.buildDarwinTemplate()
        : this.buildDefaultTemplate()

    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)

    return menu
  }

  setupDevelopmentEnvironment(): void {
    this.mainWindow.webContents.on('context-menu', (_, props) => {
      const { x, y } = props

      Menu.buildFromTemplate([
        {
          label: 'Inspect element',
          click: () => {
            this.mainWindow.webContents.inspectElement(x, y)
          }
        }
      ]).popup({ window: this.mainWindow })
    })
  }

  buildDarwinTemplate(): MenuItemConstructorOptions[] {
    const subMenuAbout: DarwinMenuItemConstructorOptions = {
      label: 'Electron',
      submenu: [
        {
          label: 'About ElectronReact',
          selector: 'orderFrontStandardAboutPanel:'
        },
        { type: 'separator' },
        { label: 'Services', submenu: [] },
        { type: 'separator' },
        {
          label: 'Hide ElectronReact',
          accelerator: 'Command+H',
          selector: 'hide:'
        },
        {
          label: 'Hide Others',
          accelerator: 'Command+Shift+H',
          selector: 'hideOtherApplications:'
        },
        { label: 'Show All', selector: 'unhideAllApplications:' },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click: () => {
            app.quit()
          }
        }
      ]
    }
    const subMenuEdit: DarwinMenuItemConstructorOptions = {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'Command+Z', selector: 'undo:' },
        { label: 'Redo', accelerator: 'Shift+Command+Z', selector: 'redo:' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'Command+X', selector: 'cut:' },
        { label: 'Copy', accelerator: 'Command+C', selector: 'copy:' },
        { label: 'Paste', accelerator: 'Command+V', selector: 'paste:' },
        {
          label: 'Select All',
          accelerator: 'Command+A',
          selector: 'selectAll:'
        }
      ]
    }
    const subMenuViewDev: MenuItemConstructorOptions = {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'Command+R',
          click: () => {
            this.mainWindow.webContents.reload()
          }
        },
        {
          label: 'Toggle Full Screen',
          accelerator: 'Ctrl+Command+F',
          click: () => {
            this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen())
          }
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: 'Alt+Command+I',
          click: () => {
            this.mainWindow.webContents.toggleDevTools()
          }
        }
      ]
    }
    const subMenuViewProd: MenuItemConstructorOptions = {
      label: 'View',
      submenu: [
        {
          label: 'Toggle Full Screen',
          accelerator: 'Ctrl+Command+F',
          click: () => {
            this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen())
          }
        }
      ]
    }
    const subMenuWindow: DarwinMenuItemConstructorOptions = {
      label: 'Window',
      submenu: [
        {
          label: 'Minimize',
          accelerator: 'Command+M',
          selector: 'performMiniaturize:'
        },
        { label: 'Close', accelerator: 'Command+W', selector: 'performClose:' },
        { type: 'separator' },
        { label: 'Bring All to Front', selector: 'arrangeInFront:' }
      ]
    }
    const subMenuHelp: MenuItemConstructorOptions = {
      label: 'Help',
      submenu: [
        {
          label: 'Learn More',
          click() {
            shell.openExternal('https://electronjs.org')
          }
        },
        {
          label: 'Documentation',
          click() {
            shell.openExternal(
              'https://github.com/electron/electron/tree/main/docs#readme'
            )
          }
        },
        {
          label: 'Community Discussions',
          click() {
            shell.openExternal('https://www.electronjs.org/community')
          }
        },
        {
          label: 'Search Issues',
          click() {
            shell.openExternal('https://github.com/electron/electron/issues')
          }
        }
      ]
    }

    const subMenuView =
      process.env.NODE_ENV === 'development' ||
      process.env.DEBUG_PROD === 'true'
        ? subMenuViewDev
        : subMenuViewProd

    return [subMenuAbout, subMenuEdit, subMenuView, subMenuWindow, subMenuHelp]
  }

  buildDefaultTemplate() {
    const templateDefault = [
      {
        label: '&文件',
        submenu: [
          {
            label: '&新建',
            accelerator: 'Ctrl+N',
            click: () => {
              this.mainWindow.webContents.send('menu:create-file', true)
            }
          },
          {
            label: '&保存',
            accelerator: 'Ctrl+S',
            click: () => {
              this.mainWindow.webContents.send('menu:save-file', true)
            }
          },
          {
            label: '&另存为',
            accelerator: 'Ctrl+Shift+S',
            click: () => {
              this.mainWindow.webContents.send('menu:save-as-file', true)
            }
          },
          {
            label: '&删除',
            accelerator: 'Ctrl+D',
            click: () => {
              this.mainWindow.webContents.send('menu:delete-file', true)
            }
          },
          {
            label: '&导入',
            accelerator: 'Ctrl+I',
            click: () => {
              this.mainWindow.webContents.send('menu:import-files', true)
            }
          },
          {
            label: '&关闭',
            accelerator: 'Ctrl+W',
            click: () => {
              this.mainWindow.close()
            }
          }
        ]
      },
      {
        label: '&视图',
        submenu:
          process.env.NODE_ENV === 'development' ||
          process.env.DEBUG_PROD === 'true'
            ? [
                {
                  label: '& 重载',
                  accelerator: 'Ctrl+R',
                  click: () => {
                    this.mainWindow.webContents.reload()
                  }
                },
                {
                  label: '& 全屏',
                  accelerator: 'F11',
                  click: () => {
                    this.mainWindow.setFullScreen(
                      !this.mainWindow.isFullScreen()
                    )
                  }
                },
                {
                  label: '& 开发者工具',
                  accelerator: 'Alt+Ctrl+I',
                  click: () => {
                    this.mainWindow.webContents.toggleDevTools()
                  }
                }
              ]
            : [
                {
                  label: '& 全屏',
                  accelerator: 'F11',
                  click: () => {
                    this.mainWindow.setFullScreen(
                      !this.mainWindow.isFullScreen()
                    )
                  }
                }
              ]
      },
      {
        label: '系统',
        submenu: [
          {
            label: '检查更新',
            click: () => {
              const icon = nativeImage.createFromPath(
                '../renderer/assets/logo.png'
              )
              const notify = new Notification({
                icon: icon,
                title: '新版本通知',
                body: '发现新版本，点击快速升级'
              })
              notify.on('click', () => {
                console.log('用户点击了通知')
              })
              notify.show()
            }
          },
          {
            label: '切换主题',
            submenu: [
              {
                label: '浅色主题',
                type: 'radio',
                checked: !nativeTheme.shouldUseDarkColors,
                click: () => {
                  nativeTheme.themeSource = 'light'
                }
              },
              {
                label: '深色主题',
                type: 'radio',
                checked: nativeTheme.shouldUseDarkColors,
                click: () => {
                  nativeTheme.themeSource = 'dark'
                }
              }
            ]
          }
        ]
      },
      {
        label: '帮助',
        submenu: [
          {
            label: '了解更多信息',
            click() {
              shell.openExternal('https://electronjs.org')
            }
          },
          {
            label: '文档',
            click() {
              shell.openExternal(
                'https://github.com/electron/electron/tree/main/docs#readme'
              )
            }
          },
          {
            label: '社区讨论',
            click() {
              shell.openExternal('https://www.electronjs.org/community')
            }
          },
          {
            label: '搜索问题',
            click() {
              shell.openExternal('https://github.com/electron/electron/issues')
            }
          }
        ]
      }
    ]

    return templateDefault
  }
}
