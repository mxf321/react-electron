import { Button, Col, Row, message } from 'antd'
import { FileAddOutlined, ImportOutlined } from '@ant-design/icons'
import {
  addFileCreator,
  setEditIdCreator,
  setFilesCreator
} from '../redux/files/filesActions'
import { AppDispatch, RootState } from '../redux/store'
import { useDispatch } from 'react-redux'
import { v4 as uuidv4 } from 'uuid'
import { useSelector } from '../redux/hooks'
import { useEffect, useState } from 'react'
import { saveFilesToStore } from '../utils/action'
import type { FileTypes } from '../types'

export const BottomBtn: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const searchFlag: boolean = useSelector(
    (state: RootState) => state.files.searchFlag
  )
  const filesList: FileTypes[] = useSelector(
    (state: RootState) => state.files.filesList
  )
  // 创建
  const createNewFile = async () => {
    if (searchFlag) {
      message.warning('请取消搜索后再新建文件')
      return false
    }
    const newID: string = uuidv4()
    const newFile: FileTypes = {
      id: newID,
      title: '',
      body: '## 请输入 markdown',
      createdAt: new Date().getTime(),
      isNew: true
    }
    dispatch(setEditIdCreator(newID))
    dispatch(addFileCreator(newFile))
  }

  // 导入
  const importFile = async () => {
    const selectResult = await window.electron.ipcRenderer.invoke(
      'dialog:open-dialog',
      {
        title: '请选择 导入的 markdown 文件',
        properties: ['openFile', 'multiSelections'],
        buttonLabel: '打开它',
        filters: [{ name: 'Markdown files', extensions: ['md'] }]
      }
    )
    const { filePaths } = selectResult
    if (filePaths.length > 0) {
      // 查看是否已存在
      debugger
      const filteredPaths: string[] = filePaths.filter((path: string) => {
        const alreadyExists = Object.values(filesList).find((file) => {
          return file.path === path
        })
        return !alreadyExists
      })
      if (!filteredPaths || !filteredPaths.length) {
        message.warning('文件已存在')
        return
      }
      const resTitle = await window.electron.ipcRenderer.invoke(
        'fs:read-file',
        filteredPaths[0]
      )
      // 全新的
      const importFilesArr: FileTypes[] = filteredPaths.map((path: string) => {
        const name = path.replace(/^.*[\\/]/, '')
        return {
          id: uuidv4(),
          title: name.split('.')[0],
          path,
          isSynced: true,
          updatedAt: new Date().getTime(),
          body: resTitle,
          isNew: false
        }
      })
      const newFiles: FileTypes[] = [...filesList, ...importFilesArr]
      dispatch(setFilesCreator(newFiles))
      saveFilesToStore(newFiles)
      if (importFilesArr.length > 0) {
        await window.electron.ipcRenderer.invoke('dialog:message-box', {
          type: 'info',
          title: `文件导入成功`,
          message: `成功导入了 ${importFilesArr.length} 个文件`
        })
      }
    }
  }

  // menu 导入，监测是否 import-dialog
  const [importFlag, setImportFlag] = useState(false)
  const [createFlag, setCreateFlag] = useState(false)
  window.electron.ipcRenderer.on('menu:import-files', (e) => {
    setImportFlag(e)
  })
  window.electron.ipcRenderer.on('menu:create-file', (e) => {
    setCreateFlag(e)
  })
  useEffect(() => {
    if (importFlag) {
      importFile()
      setImportFlag(false)
    }
    if (createFlag) {
      createNewFile()
      setCreateFlag(false)
    }
  }, [importFlag, createFlag])

  return (
    <Row gutter={10}>
      <Col span={12}>
        <Button
          type="primary"
          icon={<FileAddOutlined />}
          block
          size="large"
          onClick={createNewFile}
        >
          新建
        </Button>
      </Col>
      <Col span={12}>
        <Button
          icon={<ImportOutlined />}
          block
          size="large"
          onClick={importFile}
        >
          导入
        </Button>
      </Col>
    </Row>
  )
}
