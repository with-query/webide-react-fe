import { createBrowserRouter } from 'react-router-dom'
import App from '../App'
import Dashboard from '../pages/Dashboard'
import MyPage from '../pages/MyPage'
import Chat from '../pages/Chat'
import Workspace from '../pages/Workspace/Workspace'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { path: '', element: <Dashboard /> },
      { path: 'mypage', element: <MyPage /> },
      { path: 'chat', element: <Chat /> },
      { path: 'workspace/:id', element: <Workspace /> },
    ],
  },
])

export default router