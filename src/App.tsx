import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Layout from "./components/Layout/Layout";
import Login from "./pages/Auth/Login";
import Factory from "./pages/Factory/Factory";
import FactoryMap from "./pages/Factory/FactoryMap";
import Employee from "./pages/Employee/Employee";
import Techniques from "./pages/Techniques/Techniques";
import Setting from "./pages/Setting/Setting";
import Camera from "./pages/Camera/Camera";
import Production from "./pages/Production/Production";
import Sales from "./pages/Sales/Sales";
import Finance from "./pages/Finance/Finance";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import "./App.css";

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
            <Route path="/login" element={<LoginRoute />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<FactoryMap />} />
                      <Route path="/factory" element={<Factory />} />
                      {/* } />
                      <Route path="/employers" element={<Employee />} />
                      <Route path="/techniques" element={<Techniques />} />
                      <Route path="/setting" element={<Setting />} />
                      <Route path="/cameras" element={<Camera />} />
                      <Route path="/production" element={<Production />} />
                      <Route path="/sales" element={<Sales />} />
                      <Route path="/finance" element={<Finance />} /> */}
                    </Routes>
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
