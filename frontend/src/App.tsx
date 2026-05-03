import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import AppLayout from "./layout/AppLayout.tsx";

import LoginPage from "./pages/LoginPage.tsx";
import RegisterPage from "./pages/RegisterPage.tsx";
import GithubCallbackPage from "./pages/GithubCallbackPage.tsx";
import DashboardPage from "./pages/DashboardPage.tsx";
import WorkspacePage from "./pages/WorkspacePage.tsx";
import EditorPage from "./pages/EditorPage.tsx";
import TemplatesPage from "./pages/TemplatesPage.tsx";
import SettingsPage from "./pages/SettingsPage.tsx";
import { ReactElement } from "react";

export default function App(): ReactElement {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/auth/callback" element={<GithubCallbackPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/workspace" element={<WorkspacePage />} />
          <Route path="/editor" element={<EditorPage />} />
          <Route path="/templates" element={<TemplatesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
