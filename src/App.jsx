import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { FlowProvider } from './context/FlowContext';
import { ThemeProvider } from './context/ThemeContext';
import { CommunityProvider } from './context/CommunityContext';
import Layout from './components/Layout';
import PrayerPage from './pages/PrayerPage';
import DevotionalPage from './pages/DevotionalPage';
import JournalPage from './pages/JournalPage';
import CommunityPage from './pages/CommunityPage';
import MorePage from './pages/MorePage';
import PastEntriesPage from './pages/PastEntriesPage';
import EntryDetailPage from './pages/EntryDetailPage';
import AdminPage from './pages/AdminPage';
import AdPage from './pages/AdPage';
import PrayerDetailPage from './pages/PrayerDetailPage';
import UserRequestsPage from './pages/UserRequestsPage';
import SettingsPage from './pages/SettingsPage';
import AboutPage from './pages/AboutPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import InstallPage from './pages/InstallPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DesktopSplash from './components/DesktopSplash';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <FlowProvider>
            <CommunityProvider>
              <DesktopSplash />
              <Layout>
              <Routes>
                <Route path="/" element={<PrayerPage />} />
                <Route path="/devotional" element={<DevotionalPage />} />
                <Route path="/journal" element={<JournalPage />} />
                <Route path="/community" element={<CommunityPage />} />
                <Route path="/community/:id" element={<PrayerDetailPage />} />
                <Route path="/my-requests" element={<UserRequestsPage />} />
                <Route path="/more" element={<MorePage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/history" element={<PastEntriesPage />} />
                <Route path="/history/:id" element={<EntryDetailPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/ad" element={<AdPage />} />
                <Route path="/install" element={<InstallPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
              </Routes>
              </Layout>
            </CommunityProvider>
          </FlowProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App

