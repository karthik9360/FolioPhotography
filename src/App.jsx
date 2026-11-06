import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { BookingProvider } from './context/BookingContext'
import { ChatProvider } from './context/ChatContext'
import { SocialProvider } from './context/SocialContext'
import { TenantProvider } from './context/TenantContext'
import { ViewerProvider } from './context/ViewerContext'
import { ToastProvider } from './components/ui/Toast'
import { GuestOnly, RequireAuth } from './routes/guards'
import AppShell from './components/layout/AppShell'
import AuthShell from './components/auth/AuthShell'
import ExplorePage from './pages/ExplorePage'
import FeedPage from './pages/FeedPage'
import MessagesPage from './pages/MessagesPage'
import NotFoundPage from './pages/NotFoundPage'
import PostPage from './pages/PostPage'
import ProfilePage from './pages/ProfilePage'
import UploadPage from './pages/UploadPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import VerifyPage from './pages/auth/VerifyPage'
import AccountSettingsPage from './pages/settings/AccountSettingsPage'
import ProfileSettingsPage from './pages/settings/ProfileSettingsPage'
import SettingsLayout from './pages/settings/SettingsLayout'
import { ClientPortalPage, PhotographerDashboardPage } from './pages/DashboardPages'

// Old profile links keep working: /profile/ona-verne becomes /ona-verne.
function ProfileRedirect() {
  const { handle } = useParams()
  return <Navigate to={`/${handle}`} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <TenantProvider>
            <ChatProvider>
              <SocialProvider>
                <ViewerProvider>
                  <BookingProvider>
                    <Routes>
                      {/* Sign-in flow: full-bleed split screen, no site header. Signed-in users are sent on. */}
                      <Route element={<GuestOnly />}>
                        <Route path="auth" element={<AuthShell />}>
                          <Route index element={<Navigate to="login" replace />} />
                          <Route path="login" element={<LoginPage />} />
                          <Route path="register" element={<RegisterPage />} />
                          <Route path="verify" element={<VerifyPage />} />
                        </Route>
                      </Route>

                      <Route element={<AppShell />}>
                        <Route index element={<Navigate to="/feed" replace />} />
                        <Route path="feed" element={<FeedPage />} />
                        <Route path="explore" element={<ExplorePage />} />
                        <Route path="post/:postId" element={<PostPage />} />
                        <Route path="profile/:handle" element={<ProfileRedirect />} />

                        {/* Guards are UX only; the server must enforce access. */}
                        <Route element={<RequireAuth roles={['creator']} />}>
                          <Route path="studio" element={<PhotographerDashboardPage />} />
                          <Route path="upload" element={<UploadPage />} />
                        </Route>
                        <Route element={<RequireAuth roles={['client']} />}>
                          <Route path="client/dashboard" element={<ClientPortalPage />} />
                        </Route>
                        <Route element={<RequireAuth />}>
                          <Route path="messages" element={<MessagesPage />} />
                          <Route path="messages/:threadId" element={<MessagesPage />} />
                          <Route path="settings" element={<SettingsLayout />}>
                            <Route index element={<Navigate to="account" replace />} />
                            <Route path="account" element={<AccountSettingsPage />} />
                            <Route path="profile" element={<ProfileSettingsPage />} />
                          </Route>
                        </Route>

                        {/* Profiles live at the top level. Every other route name is reserved as a handle. */}
                        <Route path=":username" element={<ProfilePage />} />
                        <Route path="*" element={<NotFoundPage />} />
                      </Route>
                    </Routes>
                  </BookingProvider>
                </ViewerProvider>
              </SocialProvider>
            </ChatProvider>
          </TenantProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
