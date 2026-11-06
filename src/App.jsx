import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { BookingProvider } from './context/BookingContext'
import { ChatProvider } from './context/ChatContext'
import { CreativeHubProvider } from './context/CreativeHubContext'
import { SocialProvider } from './context/SocialContext'
import { StudioProvider } from './context/StudioContext'
import { StudioThemeProvider } from './context/StudioThemeContext'
import { TenantProvider } from './context/TenantContext'
import { ViewerProvider } from './context/ViewerContext'
import { ToastProvider } from './components/ui/Toast'
import { TopProgressProvider } from './components/ui/TopProgress'
import { ForbidRoles, GuestOnly, RequireAuth, RoleIndex } from './routes/guards'
import AppShell from './components/layout/AppShell'
import RootFrame from './components/layout/RootFrame'
import AuthShell from './components/auth/AuthShell'
import BillingPage from './pages/BillingPage'
import CuratePage from './pages/CuratePage'
import ExplorePage from './pages/ExplorePage'
import FeedPage from './pages/FeedPage'
import MessagesPage from './pages/MessagesPage'
import NotFoundPage from './pages/NotFoundPage'
import PostPage from './pages/PostPage'
import ProfileFeedPage from './pages/ProfileFeedPage'
import ProfilePage from './pages/ProfilePage'
import ReviewBoardPage from './pages/ReviewBoardPage'
import UploadPage from './pages/UploadPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import VerifyPage from './pages/auth/VerifyPage'
import AccountSettingsPage from './pages/settings/AccountSettingsPage'
import ProfileSettingsPage from './pages/settings/ProfileSettingsPage'
import SettingsLayout from './pages/settings/SettingsLayout'
import { PhotographerDashboardPage } from './pages/DashboardPages'

// Old profile links keep working: /profile/studio_karthik becomes /studio_karthik.
function ProfileRedirect() {
  const { handle } = useParams()
  return <Navigate to={`/${handle}`} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <StudioThemeProvider>
      <ToastProvider>
        <TopProgressProvider>
          <AuthProvider>
            <TenantProvider>
              <StudioProvider>
                <CreativeHubProvider>
                  <ChatProvider>
                    <SocialProvider>
                      <ViewerProvider>
                        <BookingProvider>
                          <Routes>
                            {/* RootFrame cross-fades between the sign-in shell and each role's app frame. */}
                            <Route element={<RootFrame />}>
                              {/* Sign-in flow: full-bleed split screen. Signed-in users are sent on. */}
                              <Route element={<GuestOnly />}>
                                <Route path="auth" element={<AuthShell />}>
                                  <Route index element={<Navigate to="login" replace />} />
                                  <Route path="login" element={<LoginPage />} />
                                  <Route path="register" element={<RegisterPage />} />
                                  <Route path="verify" element={<VerifyPage />} />
                                </Route>
                              </Route>

                              <Route element={<AppShell />}>
                                {/* "/" goes to the role's home: studio, review board, or feed. */}
                                <Route index element={<RoleIndex />} />

                                {/* Public pages. Clients are routed to their review board instead. */}
                                <Route element={<ForbidRoles roles={['client']} />}>
                                  <Route path="feed" element={<FeedPage />} />
                                  <Route path="explore" element={<ExplorePage />} />
                                  <Route path="post/:postId" element={<PostPage />} />
                                </Route>
                                <Route path="profile/:handle" element={<ProfileRedirect />} />

                                {/* Guards are UX only; the server must enforce access. */}
                                <Route element={<RequireAuth roles={['creator']} />}>
                                  <Route path="studio" element={<PhotographerDashboardPage />} />
                                  <Route path="studio/curate" element={<CuratePage />} />
                                  <Route path="upload" element={<UploadPage />} />
                                </Route>
                                <Route element={<RequireAuth roles={['creator', 'client']} />}>
                                  <Route path="studio/billing" element={<BillingPage />} />
                                </Route>
                                <Route element={<RequireAuth roles={['client']} />}>
                                  <Route path="client/dashboard" element={<ReviewBoardPage />} />
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

                                {/* Profiles live at the top level. Every other route name is a reserved handle. */}
                                <Route path=":username/feed" element={<ProfileFeedPage />} />
                                <Route path=":username" element={<ProfilePage />} />
                                <Route path="*" element={<NotFoundPage />} />
                              </Route>
                            </Route>
                          </Routes>
                        </BookingProvider>
                      </ViewerProvider>
                    </SocialProvider>
                  </ChatProvider>
                </CreativeHubProvider>
              </StudioProvider>
            </TenantProvider>
          </AuthProvider>
        </TopProgressProvider>
      </ToastProvider>
      </StudioThemeProvider>
    </BrowserRouter>
  )
}
