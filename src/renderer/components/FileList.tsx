import React, { useEffect, useRef, useState } from 'react'
import { Button, Dropdown, Flex, Input, List, message } from 'antd'
import { EditFilled, DeleteFilled, FileMarkdownFilled } from '@ant-design/icons'
import styles from './Components.module.css'
import type { InputRef, MenuProps } from 'antd'
import { useSelector } from '../redux/hooks'
import { CloseOutlined } from '@ant-design/icons'
import { useDispatch } from 'react-redux'
import {
  setActiveFileIdCreator,
  setEditIdCreator,
  setFilesCreator,
  setOpenedFileIdsCreator,
  setSearchFilesCreator
} from '../redux/files/filesActions'
import { AppDispatch, RootState } from '../redux/store'
import useKeyPress from '../hooks/useKeyPress'
import {
  getFileById,
  joinOtherPath,
  joinPath,
  saveFilesToStore
} from '../utils/action'
import { FileTypes } from '../types'

export const FileList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const [initLoading, setInitLoading] = useState<boolean>(false)
  const editId: string = useSelector((state: RootState) => state.files.editId)
  const filesList: FileTypes[] = useSelector(
    (state: RootState) => state.files.filesList
  )
  const searchFlag: boolean = useSelector(
    (state: RootState) => state.files.searchFlag
  )
  const searchFiles: FileTypes[] = useSelector(
    (state: RootState) => state.files.searchFiles
  )
  const openedFileIds: string[] = useSelector(
    (state: RootState) => state.files.openedFileIds
  )
  const activeFileId: string = useSelector(
    (state: RootState) => state.files.activeFileId
  )
  const [value, setValue] = useState<string>('')
  const inputRef = useRef<InputRef>(null)
  const enterPressed = useKeyPress(13)
  const escPressed = useKeyPress(27)

  let fileStore: FileTypes[] = []
  // 获取 ipc 的数据
  const handleIpc = async () => {
    fileStore = await window.electron.ipcRenderer.getStoreValue('files')
    dispatch(setFilesCreator(fileStore))
  }
  useEffect(() => {
    handleIpc()
  }, [])

  const [files, setFiles] = useState<FileTypes[]>(fileStore)
  const editItem: FileTypes | undefined = getFileById(files, editId)
  // 关闭 重命名  新增的数据isNew为true时关闭即删除
  const closeSearch = () => {
    if (editItem && !editItem.isNew) {
      dispatch(setEditIdCreator(''))
      setValue('')
    } else {
      delAction(editId)
    }
  }

  // 右键弹窗的 file 数据
  const [openFileId, setOpenFileId] = useState<string>()
  const openChange = (file: FileTypes) => {
    const res = getFileById(files, file.id) as FileTypes
    setOpenFileId(res && res.id)
  }
  // 右键弹窗 menus
  const items: MenuProps['items'] = [
    {
      label: '打开',
      key: 'fileClick',
      onClick: () => {
        fileClick(openFileId!)
      }
    },
    {
      label: '重命名',
      key: 'updateFileName',
      onClick: () => {
        editAction(openFileId!)
      }
    },
    {
      label: '删除',
      key: 'deleteFile',
      onClick: () => {
        delAction(openFileId!)
      }
    }
  ]
  // 重命名操作
  // 多个 重命名操作入口，现取file数据
  const editAction = async (id: string) => {
    dispatch(setEditIdCreator(id))
    const actionFile = getFileById(files, id) as FileTypes
    setValue(actionFile.title)
  }
  // 删除操作
  // 4个删除操作入口，现取file数据
  const delAction = async (id: string) => {
    const actionFile = getFileById(files, id) as FileTypes
    const restOpenedFileIds: string[] = openedFileIds.filter(
      (tagId) => tagId !== id
    )
    dispatch(setOpenedFileIdsCreator(restOpenedFileIds))
    if (activeFileId === id) {
      dispatch(setActiveFileIdCreator(restOpenedFileIds[0]))
    }
    // 有searchFlag时才删除 searchFiles 数据，一定删除filesList数据
    if (searchFlag) {
      const restSearchFiles: FileTypes[] = files.filter(
        (file: FileTypes) => file.id !== id
      )
      dispatch(setSearchFilesCreator(restSearchFiles))
    }
    const restItem: FileTypes[] = filesList.filter(
      (file: FileTypes) => file.id !== id
    )
    dispatch(setFilesCreator(restItem))
    saveFilesToStore(restItem)
    if (!actionFile.isNew) {
      await window.electron.ipcRenderer.invoke(
        'fs:delete-file',
        actionFile.path
      )
    }
  }

  const editClick = (e, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    editAction(id)
  }
  const delClick = (e, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    delAction(id)
  }
  const fileClick = async (id: string) => {
    dispatch(setActiveFileIdCreator(id))
    if (!openedFileIds.includes(id)) {
      dispatch(setOpenedFileIdsCreator([...openedFileIds, id]))
    }
  }

  const updateFileName = async (id, title, isNew) => {
    const newPath = isNew
      ? await joinPath(value)
      : await joinOtherPath({
          filePath: editItem && editItem.path,
          fileName: value
        })
    // 有searchFlag时才修改 searchFiles 数据，一定 修改 filesList数据
    if (searchFlag) {
      const newSearchFiles: FileTypes[] = searchFiles.map((file: FileTypes) => {
        if (file.id === editId) {
          file = { ...file, title: value, isNew: false, path: newPath }
        }
        return file
      })
      dispatch(setSearchFilesCreator(newSearchFiles))
    }
    if (isNew) {
      await window.electron.ipcRenderer.invoke('fs:write-file', {
        filePath: newPath,
        data: editItem && editItem.body
      })
    } else {
      const oldPath = editItem && editItem.path
      await window.electron.ipcRenderer.invoke('fs:rename-file', {
        filePath: oldPath,
        newFilePath: newPath
      })
    }
    const newFiles: FileTypes[] = filesList.map((file: FileTypes) => {
      if (file.id === editId) {
        file = { ...file, title: value, isNew: false, path: newPath }
      }
      return file
    })
    dispatch(setFilesCreator(newFiles))
    saveFilesToStore(newFiles)
  }

  // 过滤相同文件 title
  const filterValue = (filesArr: FileTypes[], val: string) => {
    return filesArr.find((file: FileTypes) => file.title === val)
  }
  useEffect(() => {
    if (enterPressed && editId && value.trim() !== '') {
      if (filterValue(filesList, value.trim())) {
        message.warning('文件名称已重复')
        return
      }
      updateFileName(editItem && editItem.id, value, editItem && editItem.isNew)
      setValue('')
      dispatch(setEditIdCreator(''))
    }
    if (escPressed && editId) {
      closeSearch()
    }
  }, [enterPressed, escPressed])

  useEffect(() => {
    searchFlag ? setFiles(searchFiles) : setFiles(filesList)
  }, [filesList, searchFiles, searchFlag])

  useEffect(() => {
    if (editId) {
      inputRef.current?.focus()
      // 判断是新增还是修改，新增时没search，即用filesList，input的title清空
      const editFilesItem: FileTypes | undefined = filesList.find(
        (file) => file.id === editId
      )
      if (editFilesItem && editFilesItem.isNew) {
        setValue('')
      }
    }
  }, [editId])

  // menu 删除文件，删除 activeFileId
  const [deleteFlag, setDeleteFlag] = useState<boolean>(false)
  window.electron.ipcRenderer.on('menu:delete-file', (e) => {
    setDeleteFlag(e)
  })
  useEffect(() => {
    if (deleteFlag) {
      activeFileId
        ? delAction(activeFileId)
        : message.info('请先确定要删除的文件')
      setDeleteFlag(false)
    }
  }, [deleteFlag])

  return (
    <>
      <div className={styles['counter-text']}>
        Current value: <strong id="counter">{files.length}</strong>
      </div>
      <List
        className={styles['flie-list-container']}
        loading={initLoading}
        itemLayout="horizontal"
        dataSource={files}
        renderItem={(file: any) =>
          file.id === editId ? (
            <Flex align="center" justify="space-between">
              <Input
                placeholder="请输入文件名称"
                allowClear
                ref={inputRef}
                defaultValue={value}
                onChange={(e) => {
                  setValue(e.target.value)
                }}
              />
              <Button
                type="text"
                icon={<CloseOutlined />}
                onClick={closeSearch}
              />
            </Flex>
          ) : (
            <Dropdown
              menu={{ items }}
              trigger={['contextMenu']}
              onOpenChange={() => {
                openChange(file)
              }}
            >
              <List.Item
                actions={[
                  <a onClick={(e) => editClick(e, file.id)}>
                    <EditFilled />
                  </a>,
                  <a onClick={(e) => delClick(e, file.id)}>
                    <DeleteFilled />
                  </a>
                ]}
                key={file.id}
                onClick={() => fileClick(file.id)}
              >
                <List.Item.Meta
                  avatar={<FileMarkdownFilled />}
                  title={file.title}
                />
              </List.Item>
            </Dropdown>
          )
        }
      />
    </>
  )
}
