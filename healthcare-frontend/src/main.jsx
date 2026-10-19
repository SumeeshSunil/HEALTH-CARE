import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'

import './index.css'
import App from './App.jsx'
import { store } from './redux/store.js'
import { ToastProvider } from './components/Toast.jsx'
import AuthSession from './components/AuthSession.jsx'
import { restoreSession } from './redux/slices/authSlice.js'
import { saveToken } from './services/session.js'

let savedToken = store.getState().auth.token;
saveToken(savedToken);
store.subscribe(() => {
  const token = store.getState().auth.token;
  if (token !== savedToken) {
    savedToken = token;
    saveToken(token);
  }
});
store.dispatch(restoreSession());

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <ToastProvider>
        <AuthSession><App /></AuthSession>
      </ToastProvider>
    </Provider>
  </StrictMode>,
)
