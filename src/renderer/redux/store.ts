import { combineReducers, configureStore } from '@reduxjs/toolkit'
import filesReducer from './files/filesReducer'

// 新的 combineReducers 路由兼容旧的 combineReducers
const rootReducer = combineReducers({
  files: filesReducer
})

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
  devTools: true
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default { store }
