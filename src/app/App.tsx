import { Outlet } from 'react-router-dom'
import { ErrorModal } from '../shared/notifications/ErrorModal'
import { Toast } from '../shared/notifications/Toast'

function App() {
  return (
    <>
      <ErrorModal />
      <Toast />
      <Outlet />
    </>
  )
}

export default App
