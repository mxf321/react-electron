import useKeyPress from '../hooks/useKeyPress'
import { useEffect, useRef, useState } from 'react'
import { SearchOutlined, CloseOutlined } from '@ant-design/icons'
import { Button, Flex, Input } from 'antd'
import styles from './Components.module.css'
import type { InputRef } from 'antd'
import { useSelector } from '../redux/hooks'
import { useDispatch } from 'react-redux'
import { AppDispatch, RootState } from '../redux/store'
import {
  setSearchFilesCreator,
  setSearchFlagCreator
} from '../redux/files/filesActions'
import type { FileTypes } from '../types'
type PropsType = {
  title: string
}

export const FileSearch: React.FC<PropsType> = ({ title }) => {
  const dispatch = useDispatch<AppDispatch>()
  const [inputActive, setInputActive] = useState<boolean>(false)
  const [value, setValue] = useState<string>('')
  const filesList: FileTypes[] = useSelector(
    (state: RootState) => state.files.filesList
  )
  const enterPressed = useKeyPress(13)
  const escPressed = useKeyPress(27)
  const inputRefSearch = useRef<InputRef>(null)
  // 关闭搜索时
  const closeSearch = () => {
    setInputActive(false)
    setValue('')
    dispatch(setSearchFilesCreator([]))
    dispatch(setSearchFlagCreator(false))
  }
  // 搜索时
  const onSearch = (val: string) => {
    setValue(val)
    const newFiles = filesList.filter((file: FileTypes) =>
      file.title.includes(val)
    )
    dispatch(setSearchFlagCreator(true))
    dispatch(setSearchFilesCreator(newFiles))
  }

  useEffect(() => {
    if (enterPressed && inputActive) {
      onSearch(value)
    }
    if (escPressed && inputActive) {
      closeSearch()
    }
  }, [enterPressed, escPressed])

  useEffect(() => {
    if (inputActive) {
      inputRefSearch.current?.focus()
    }
  }, [inputActive])

  return (
    <div className={styles['search-container']}>
      <Flex align="center" justify="space-between">
        {!inputActive && (
          <>
            <span>{title}</span>
            <Button
              type="text"
              icon={<SearchOutlined />}
              onClick={() => setInputActive(true)}
            />
          </>
        )}
        {inputActive && (
          <>
            <Input
              placeholder="请输入文件名称"
              allowClear
              ref={inputRefSearch}
              onChange={(e) => {
                onSearch(e.target.value)
              }}
            />
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={closeSearch}
            />
          </>
        )}
      </Flex>
    </div>
  )
}
