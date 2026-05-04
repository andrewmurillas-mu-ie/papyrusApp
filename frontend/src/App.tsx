import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './layout/AppLayout';
import { WorkspaceProvider } from './context/WorkspaceContext';
import { AuthProvider } from './context/AuthContext';
import { PagesProvider } from './context/PagesContext';

import LoginPage from './pages/LoginPage';
import GithubCallbackPage from './pages/GithubCallbackPage';
import DashboardPage from './pages/DashboardPage';
import WorkspacePage from './pages/WorkspacePage';
import EditorPage from './pages/EditorPage';
import TemplatesPage from './pages/TemplatesPage';
import SettingsPage from './pages/SettingsPage';

export default function App(): React.ReactElement {
  return (
    <AuthProvider>
      <WorkspaceProvider>
        <PagesProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/github/callback" element={<GithubCallbackPage />} />
            
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/workspace" element={<WorkspacePage />} />
                <Route path="/editor" element={<EditorPage />} />
                <Route path="/editor/:pageId" element={<EditorPage />} />
                <Route path="/page/:pageId" element={<EditorPage />} />
                <Route path="/templates" element={<TemplatesPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/editor" replace />} />
          </Routes>
        </PagesProvider>
      </WorkspaceProvider>
    </AuthProvider>
  );
}
