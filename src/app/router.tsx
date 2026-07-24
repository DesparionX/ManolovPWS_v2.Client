import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import { Layout } from '../shared/layout/Layout'
import { RequireAuth } from '../shared/auth/RequireAuth'
import { SignInPage } from '../pages/SignInPage'
import { HomePage } from '../pages/HomePage'
import { PostDetailPage } from '../pages/PostDetailPage'
import { ProjectsPage } from '../pages/ProjectsPage'
import { ProjectDetailPage } from '../pages/ProjectDetailPage'
import { CVPage } from '../pages/CVPage'
import { ContactPage } from '../pages/ContactPage'
import { AdminLayout } from '../pages/admin/AdminLayout'
import { ProfilePage } from '../pages/admin/ProfilePage'
import { PostsPage as AdminPostsPage } from '../pages/admin/PostsPage'
import { PostEditorPage } from '../pages/admin/PostEditorPage'
import { ProjectsPage as AdminProjectsPage } from '../pages/admin/ProjectsPage'
import { ProjectEditorPage } from '../pages/admin/ProjectEditorPage'
import { InboxPage } from '../pages/admin/InboxPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        element: <Layout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: 'posts/:id', element: <PostDetailPage /> },
          { path: 'projects', element: <ProjectsPage /> },
          { path: 'projects/:id', element: <ProjectDetailPage /> },
          { path: 'cv', element: <CVPage /> },
          { path: 'contact', element: <ContactPage /> },
          { path: 'admin/auth', element: <SignInPage /> },
          {
            path: 'admin',
            element: <RequireAuth />,
            children: [
              {
                element: <AdminLayout />,
                children: [
                  { index: true, element: <ProfilePage /> },
                  { path: 'profile', element: <ProfilePage /> },
                  { path: 'posts', element: <AdminPostsPage /> },
                  { path: 'posts/new', element: <PostEditorPage /> },
                  { path: 'posts/:id', element: <PostEditorPage /> },
                  { path: 'projects', element: <AdminProjectsPage /> },
                  { path: 'projects/new', element: <ProjectEditorPage /> },
                  { path: 'projects/:id', element: <ProjectEditorPage /> },
                  { path: 'inbox', element: <InboxPage /> },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
])
