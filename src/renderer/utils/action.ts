import { FileTypes } from '../types'

// 保存在 electron-store
export const saveFilesToStore = (files: FileTypes[]) => {
  window.electron.ipcRenderer.setStoreValue('files', files)
}

// 通过 id 获取 file
export const getFileById = (filesArr: FileTypes[], fileId: string) => {
  return filesArr.find((file: FileTypes) => {
    return file.id === fileId
  })
}
// 另存为的 path
export const joinPath = async (fileName: string) => {
  return await window.electron.ipcRenderer.invoke('path:join-path', fileName)
}
export const joinOtherPath = async ({ filePath, fileName }) => {
  return await window.electron.ipcRenderer.invoke('path:join-other-path', {
    filePath,
    fileName
  })
}
