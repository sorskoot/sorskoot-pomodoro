import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import TimerPage from './pages/TimerPage';
import ProjectsPage from './pages/ProjectsPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<TimerPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}
