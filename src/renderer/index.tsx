import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/reset.css'
import rootStore from './redux/store'
import { Provider } from 'react-redux'
// const container = document.getElementById('root') as HTMLElement;
// const root = createRoot(container);
// root.render(<App />);
ReactDOM.createRoot(document.getElementById('root')!).render(
  // <React.StrictMode>
    <Provider store={rootStore.store}>
      <App />
    </Provider>
  // </React.StrictMode>,
)

// 监测在线或离线
function refreshStatus() {
  window.electron.ipcRenderer.send("network:change", navigator.onLine);
}
refreshStatus();
window.addEventListener("online", refreshStatus);
window.addEventListener("offline", refreshStatus);
// 监测在线或离线 end

// calling IPC exposed from preload script
window.electron.ipcRenderer.once('ipc-example', (arg) => {
  // eslint-disable-next-line no-console
  console.log(arg);
});
window.electron.ipcRenderer.sendMessage('ipc-example', ['ping']);
