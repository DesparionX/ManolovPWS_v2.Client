import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import { Layout } from '../shared/layout/Layout'
import { RequireAuth } from '../shared/auth/RequireAuth'
import { SignInPage } from '../pages/SignInPage'
import { HomePage } from '../pages/HomePage'
import { ProjectsPage } from '../pages/ProjectsPage'
import { CVPage } from '../pages/CVPage'
import { ContactPage } from '../pages/ContactPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        element: <Layout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: 'projects', element: <ProjectsPage /> },
          { path: 'cv', element: <CVPage /> },
          { path: 'contact', element: <ContactPage /> },
          { path: 'admin/auth', element: <SignInPage /> },
          { path: 'admin', element: <RequireAuth /> },
        ],
      },
    ],
  },
])
