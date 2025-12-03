import React from "react";
import "./i18n";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Layout from "./components/Layout/Layout";
import Login from "./pages/Auth/Login";
import FactoryMap from "./pages/Factory/FactoryMap";
import Employee from "./pages/Employee/Employee";
import Techniques from "./pages/Techniques/Techniques";
import Setting from "./pages/Setting/Setting";
import Camera from "./pages/Camera/Camera";
import Production from "./pages/Production/Production";
import Sales from "./pages/Sales/Sales";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Factory from "./pages/Factory/Factory";
import BranchesPage from "./pages/Employee/components/BranchData";
import InternshipPage from "./pages/Employee/components/InternshipPage";
import LanguagePage from "./pages/Employee/components/LanguagePage";
import Finance from "./pages/Finance/Finance";
import Partners from "./pages/Partners/Partners";
import Applications from "./pages/Applications/Applications";

// Modules imports - alohida module
import ModuleAuth from "./pages/modules/Auth";
import ModuleDashboard from "./pages/modules/Dashboard";
import ModuleListingForm from "./pages/modules/ListingForm";
import ModulePartnerProfile from "./pages/modules/PartnerProfile";
import { useModulesAuth } from "./pages/modules/hooks/useModulesAuth";

const LoginRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/factory" /> : <Login />;
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

// Role-based route component
const RoleBasedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles: string[];
}> = ({ children, allowedRoles }) => {
  const { role } = useAuth();

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/factory" />;
  }

  return <>{children}</>;
};

// Main routes component
const AppRoutes: React.FC = () => {
  const { role } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<FactoryMap />} />
      <Route path="/factory" element={<Factory />} />
      {/* Setting page only for admin and editor */}
      <Route
        path="/setting"
        element={
          <RoleBasedRoute allowedRoles={["admin", "editor"]}>
            <Setting />
          </RoleBasedRoute>
        }
      />

      {/* Other pages accessible by admin and user, but not viewer */}
      {role !== "viewer" && (
        <>
          <Route path="/employers" element={<Employee />} />
          <Route path="/employers/branches" element={<BranchesPage />} />
          <Route path="/employers/internships" element={<InternshipPage />} />
          <Route path="/employers/languages" element={<LanguagePage />} />
          <Route path="/techniques" element={<Techniques />} />
          <Route path="/cameras" element={<Camera />} />
          <Route path="/production" element={<Production />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/partners" element={<Partners />} />
          <Route path="/applications" element={<Applications />} />
        </>
      )}

      {/* Viewer can only access factory pages */}
      {role === "viewer" && (
        <Route path="*" element={<Navigate to="/factory" />} />
      )}
    </Routes>
  );
};

// Partners Module Routes - alohida auth va layout
const PartnersModuleRoutes: React.FC = () => {
  const { isAuthenticated, isLoading } = useModulesAuth();

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="ml-4">Checking authentication...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/auth" element={<ModuleAuth />} />

      {/* Protected routes - faqat authenticated user'lar uchun */}
      {isAuthenticated ? (
        <>
          <Route path="/dashboard" element={<ModuleDashboard />} />
          <Route path="/applications" element={<ModuleListingForm />} />
          <Route path="/profile" element={<ModulePartnerProfile />} />
          <Route
            path="/"
            element={<Navigate to="/partner-portal/dashboard" />}
          />
        </>
      ) : (
        <Route path="*" element={<Navigate to="/partner-portal/auth" />} />
      )}
    </Routes>
  );
};

// QueryClient yaratish
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Asosiy tizim routes */}
            <Route path="/login" element={<LoginRoute />} />

            {/* Partner Portal - alohida tizim, o'z auth va layouti bilan */}
            <Route
              path="/partner-portal/*"
              element={<PartnersModuleRoutes />}
            />

            {/* Asosiy tizim - himoyalangan routes */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AppRoutes />
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
