import type { FileTypes } from '@/renderer/types'

export const SET_EDITID = 'setEditId'
export const SET_ACTIVEFILEID = 'setActiveFileId'
export const SET_OPENEDFILEIDS = 'setOpenedFileIds'
export const SET_SEARCHFILES = 'setSearchFiles'
export const SET_SEARCHFLAG = 'setSearchFlag'
export const SET_FILES = 'setFiles'
export const ADD_FILELIST = 'addFile'

export interface ISetEditIdAction {
  type: typeof SET_EDITID
  payload: string
}
export interface ISetActiveFileIdAction {
  type: typeof SET_ACTIVEFILEID
  payload: string
}
export interface ISetOpenedFileIdsAction {
  type: typeof SET_OPENEDFILEIDS
  payload: string[]
}
export interface ISetSearchFilesAction {
  type: typeof SET_SEARCHFILES
  payload: FileTypes[]
}

export interface ISetSearchFlagAction {
  type: typeof SET_SEARCHFLAG
  payload: boolean
}

export interface ISetFilesAction {
  type: typeof SET_FILES
  payload: FileTypes[]
}

export interface IAddFileAction {
  type: typeof ADD_FILELIST
  payload: FileTypes
}


export type FilesActionTypes =
  | ISetFilesAction
  | ISetActiveFileIdAction
  | ISetOpenedFileIdsAction
  | ISetSearchFilesAction
  | ISetSearchFlagAction
  | ISetEditIdAction
  | IAddFileAction

export const setEditIdCreator = (id: string): ISetEditIdAction => {
  return {
    type: SET_EDITID,
    payload: id
  }
}
export const setActiveFileIdCreator = (id: string): ISetActiveFileIdAction => {
  return {
    type: SET_ACTIVEFILEID,
    payload: id
  }
}

export const setOpenedFileIdsCreator = (
  ids: string[]
): ISetOpenedFileIdsAction => {
  return {
    type: SET_OPENEDFILEIDS,
    payload: ids
  }
}

export const setSearchFilesCreator = (
  files: FileTypes[]
): ISetSearchFilesAction => {
  return {
    type: SET_SEARCHFILES,
    payload: files
  }
}
export const setSearchFlagCreator = (
  searchFlag: boolean
): ISetSearchFlagAction => {
  return {
    type: SET_SEARCHFLAG,
    payload: searchFlag
  }
}

export const setFilesCreator = (files: FileTypes[]): ISetFilesAction => {
  return {
    type: SET_FILES,
    payload: files
  }
}

export const addFileCreator = (file: FileTypes): IAddFileAction => {
  return {
    type: ADD_FILELIST,
    payload: file
  }
}

