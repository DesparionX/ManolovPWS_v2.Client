import { Outlet } from 'react-router-dom'
import { ErrorModal } from '../shared/notifications/ErrorModal'
import { Toast } from '../shared/notifications/Toast'
import { AppBackground } from '../shared/layout/AppBackground'

function App() {
  return (
    <>
      <AppBackground />
      <ErrorModal />
      <Toast />
      <Outlet />
    </>
  )
}

export default App
