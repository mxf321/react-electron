import { Button, message } from 'antd'
import { FileAddOutlined, CloseOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import styles from './Components.module.css'
import { Tag } from 'antd'
import Vditor from 'vditor'
import 'vditor/dist/index.css'
import { useSelector } from '../redux/hooks'
import { useDispatch } from 'react-redux'
import { AppDispatch, RootState } from '../redux/store'
import {
  setActiveFileIdCreator,
  setFilesCreator,
  setOpenedFileIdsCreator
} from '../redux/files/filesActions'
import { getFileById, saveFilesToStore } from '../utils/action'
import { FileTypes } from '../types'

export const NoteContent: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const activeFileId: string = useSelector(
    (state: RootState) => state.files.activeFileId
  )
  const filesList: FileTypes[] = useSelector(
    (state: RootState) => state.files.filesList
  )
  const activeFile: FileTypes | undefined = filesList.find(
    (file: FileTypes) => file.id === activeFileId
  )
  const openedFileIds: string[] = useSelector(
    (state: RootState) => state.files.openedFileIds
  )
  const openedFiles: (FileTypes | undefined)[] = openedFileIds.map(
    (openID: string) => {
      return filesList.find((file: FileTypes) => {
        return file.id === openID
      })
    }
  )
  const selectedTagIds: string[] = openedFileIds.filter((id: string) => {
    return id === activeFileId
  })
  // Vditor
  const [editValue, setEditValue] = useState<string>()
  const [vd, setVd] = useState<Vditor>()
  let vditor
  const initEditor = (params) => {
    let { value } = params
    value = value ? value : ' '
    vditor = new Vditor('vditor', {
      preview: {
        maxWidth: 300
      },
      after: () => {
        vditor.setValue(value)
        setVd(vditor)
      },
      blur() {
        saveDoc()
      }
    })
    return vditor
  }

  const saveDoc = () => {
    //在初始化时已经把vditor赋值到this对象上 可直接通过getValue方法获取当前编辑器的值
    const mdValue = vditor && vditor.getValue()
    setEditValue(mdValue)
  }
  useEffect(() => {
    if (activeFileId) {
      initEditor({ value: activeFile && activeFile.body })
      // Clear the effect
      return () => {
        vd?.destroy()
        setVd(undefined)
      }
    }
  }, [activeFileId])

  // tab change
  const handleChange = (id: string) => {
    dispatch(setActiveFileIdCreator(id))
  }

  // 更改 files 的数据 ：body有变
  const changeFileWithBodyById = (
    filesArr: FileTypes[],
    fileId: string,
    body: string | undefined
  ) => {
    const newFiles: FileTypes[] = filesArr.map((file: FileTypes) => {
      if (file.id === fileId) {
        file = { ...file, body: body, isNew: false }
      }
      return file
    })
    dispatch(setFilesCreator(newFiles))
    saveFilesToStore(newFiles)
  }

  // submitAction
  const submitAction = async (
    body: string | undefined,
    filePath: string | undefined
  ) => {
    // editValue 与 body 相同，不用再 fs:write-file
    if (editValue !== body) {
      changeFileWithBodyById(filesList, activeFileId, editValue)
      await window.electron.ipcRenderer.invoke('fs:write-file', {
        filePath,
        data: editValue
      })
    }
    await window.electron.ipcRenderer.invoke('dialog:message-box', {
      icon: '../assets/logo.png',
      type: 'info',
      title: '保存成功',
      message: '文件保存成功'
    })
  }
  // saveAction
  const saveAction = async () => {
    // body 没更改，直接return
    const options = {
      title: '保存文件',
      buttonLabel: '就它了',
      // 打开默认路径
      defaultPath: activeFile && activeFile.title,
      filters: [
        { name: 'Markdown files', extensions: ['md'] },
        { name: '文本文件', extensions: ['txt', 'html', 'json'] },
        { name: '视频文件', extensions: ['mp4', 'avi'] },
        { name: '所有文件', extensions: ['*'] }
      ]
    }
    const selectResult = await window.electron.ipcRenderer.invoke(
      'dialog:save-dialog',
      options
    )
    const filePath = selectResult.filePath
    const { body } = getFileById(filesList, activeFileId) as FileTypes
    submitAction(body, filePath)
  }
  // 保存
  const onSubmitClick = async () => {
    const { path, body } = getFileById(filesList, activeFileId) as FileTypes
    submitAction(body, path)
  }

  // 另存为
  const saveAsClick = async () => {
    if (!activeFileId) {
      message.info('请先确定需要另存为的文件')
      return
    }
    saveAction()
  }

  // tab 删除，不影响 filesList 原数据组
  const tabClose = (e, id: string) => {
    e.stopPropagation()
    const restOpenedFileIds: string[] = openedFileIds.filter(
      (tagId) => tagId !== id
    )
    dispatch(setOpenedFileIdsCreator(restOpenedFileIds))
    if (id === activeFileId) {
      dispatch(setActiveFileIdCreator(restOpenedFileIds[0]))
    }
  }
  // 监测 menu 变化
  const [saveFlag, setSaveFlag] = useState<boolean>(false)
  const [saveAsFlag, setSaveAsFlag] = useState<boolean>(false)
  window.electron.ipcRenderer.on('menu:save-file', (e) => {
    setSaveFlag(e)
  })
  window.electron.ipcRenderer.on('menu:save-as-file', (e) => {
    setSaveAsFlag(e)
  })
  useEffect(() => {
    if (saveFlag) {
      if (!activeFileId) {
        message.info('请先确定需要另存为的文件')
        return
      }
      onSubmitClick()
      setSaveFlag(false)
    }
    if (saveAsFlag) {
      saveAsClick()
      setSaveAsFlag(false)
    }
  }, [saveFlag, saveAsFlag])

  return (
    <>
      {!activeFileId && (
        <div className={styles['start-page']}>
          选择或者创建新的 Markdown 文档
        </div>
      )}
      {activeFileId && (
        <>
          {openedFiles.map((file) => (
            <Tag.CheckableTag
              key={file!.id}
              className={`${styles['tags-view-item']} ${
                file!.id === activeFileId ? styles['active'] : ''
              } `}
              checked={selectedTagIds.includes(file!.id)}
              onChange={() => handleChange(file!.id)}
            >
              {file!.title}
              {file!.id !== activeFileId && (
                <CloseOutlined onClick={(e) => tabClose(e, file!.id)} />
              )}
            </Tag.CheckableTag>
          ))}
          <div id="vditor" className={styles.vditor} />
          <Button
            block
            type="primary"
            title="保存"
            onClick={onSubmitClick}
            icon={<FileAddOutlined />}
          >
            保存
          </Button>
        </>
      )}
    </>
  )
}
