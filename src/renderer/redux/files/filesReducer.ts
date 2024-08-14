import type { FileTypes } from '@/renderer/types'
import {
  SET_EDITID,
  SET_ACTIVEFILEID,
  SET_OPENEDFILEIDS,
  SET_SEARCHFILES,
  SET_SEARCHFLAG,
  SET_FILES,
  ADD_FILELIST,
  FilesActionTypes
} from './filesActions'

export interface IFilesState {
  editId: string
  activeFileId: string
  searchFiles: FileTypes[]
  searchFlag: boolean
  openedFileIds: string[]
  filesList: FileTypes[]
}

const defaultState: IFilesState = {
  editId: '',
  activeFileId: '',
  openedFileIds: [],
  searchFlag: false,
  searchFiles: [],
  filesList: []
}
const isFind = (filesList: FileTypes[], title: string) => {
  return filesList.find((item) => item.title === title)
}

const filesReducer = (state = defaultState, action: FilesActionTypes) => {
  switch (action.type) {
    // 设置 editId
    case SET_EDITID:
      return { ...state, editId: action.payload }
    case SET_ACTIVEFILEID:
      return { ...state, activeFileId: action.payload }
    case SET_OPENEDFILEIDS:
      return { ...state, openedFileIds: action.payload }

    case SET_SEARCHFILES:
      return { ...state, searchFiles: action.payload }
    case SET_SEARCHFLAG:
      return { ...state, searchFlag: action.payload }

    case SET_FILES:
      return { ...state, filesList: action.payload }

    case ADD_FILELIST:
      // 处理重复
      if (!isFind(state.filesList, action.payload.title)) {
        return {
          ...state,
          filesList: [...state.filesList, action.payload]
        }
      } else {
        return { ...state }
      }

    default:
      return state
  }
}
export default filesReducer
