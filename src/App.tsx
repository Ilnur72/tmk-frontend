import React, { Suspense, lazy } from "react";
import "./i18n";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Layout from "./components/Layout/Layout";
import Login from "./pages/Auth/Login";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { homeFor, isPathAllowed } from "./config/roleScope";
import { useModulesAuth } from "./pages/modules/hooks/useModulesAuth";

// ─── Lazy-loaded pages (route-based code splitting) ─────────────────────────
// Har bir sahifa alohida chunk'da — faqat kerak bo'lganda (auth'dan keyin) yuklanadi.
// Login qilmagan foydalanuvchi bu kodni umuman olmaydi.
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Factory = lazy(() => import("./pages/Factory/Factory"));
const FactoryMap = lazy(() => import("./pages/Factory/FactoryMap"));
const Employee = lazy(() => import("./pages/Employee/Employee"));
const Techniques = lazy(() => import("./pages/Techniques/Techniques"));
const Setting = lazy(() => import("./pages/Setting/Setting"));
const Camera = lazy(() => import("./pages/Camera/Camera"));
const Production = lazy(() => import("./pages/Production/Production"));
const Sales = lazy(() => import("./pages/Sales/Sales"));
const Finance = lazy(() => import("./pages/Finance/Finance"));
const Partners = lazy(() => import("./pages/Partners/Partners"));
const Energy = lazy(() => import("./pages/Energy"));
const ESG = lazy(() => import("./pages/ESG"));
const IntegrationMonitor = lazy(() => import("./pages/IntegrationMonitor/IntegrationMonitor"));
const BranchesPage = lazy(() => import("./pages/Employee/components/BranchData"));
const InternshipPage = lazy(() => import("./pages/Employee/components/InternshipPage"));
const LanguagePage = lazy(() => import("./pages/Employee/components/LanguagePage"));
const TodayAttendancePage = lazy(() => import("./pages/Employee/components/TodayAttendancePage"));

// Energy Systems - mustaqil tizimlar
const MeterOperators = lazy(() => import("./pages/MeterOperators"));
const EnergyManagement = lazy(() => import("./pages/EnergyManagement"));

// Modules - alohida module
const ModuleAuth = lazy(() => import("./pages/modules/Auth"));
const ModuleDashboard = lazy(() => import("./pages/modules/Dashboard"));
const ModuleListingForm = lazy(() => import("./pages/modules/ListingForm"));
const ModulePartnerProfile = lazy(() => import("./pages/modules/PartnerProfile"));

// ─── Suspense fallback (chunk yuklanayotganda ko'rsatiladigan loader) ────────
const PageLoader: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

const LoginRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/dashboard" /> : <Login />;
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

/**
 * Qamrov qorovuli — qamrovi cheklangan rol (masalan `factory_manager`) o'z
 * ro'yxatidan tashqaridagi manzilga kira olmaydi.
 *
 * ⚠️ Menyudan yashirish YETARLI EMAS: `ProtectedRoute` faqat login
 * qilinganini tekshiradi, rolni emas — ya'ni foydalanuvchi manzilni qo'lda
 * yozib kiraverardi.
 *
 * Nega bitta joyda, har bir `Route` da emas: bu komponent butun `AppRoutes`
 * ni o'raydi, demak ertaga qo'shilgan YANGI route ham avtomatik yopiq
 * qoladi. Har bir route'ni alohida o'rash esa bittasini unutish bilan
 * tugardi.
 *
 * Cheklanmagan rol uchun `homeFor` `null` qaytaradi va qorovul umuman
 * aralashmaydi — mavjud xulq o'zgarmaydi.
 */
const ScopeGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { role } = useAuth();
  const location = useLocation();

  const home = homeFor(role);
  if (home !== null && !isPathAllowed(role, location.pathname)) {
    return <Navigate to={home} replace />;
  }

  return <>{children}</>;
};

// Main routes component
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/factory" element={<Factory />} />
      <Route path="/factorymap" element={<FactoryMap />} />
      {/* Setting page only for admin and editor */}
      <Route
        path="/setting"
        element={
          <RoleBasedRoute allowedRoles={["admin", "editor"]}>
            <Setting />
          </RoleBasedRoute>
        }
      />

      {/* All pages accessible by all authenticated users */}
      <Route path="/employers" element={<Employee />} />
      <Route path="/employers/branches" element={<BranchesPage />} />
      <Route path="/employers/internships" element={<InternshipPage />} />
      <Route path="/employers/languages" element={<LanguagePage />} />
      <Route
        path="/employers/today-attendance"
        element={<TodayAttendancePage />}
      />
      {/* <Route path="/techniques" element={<Techniques />} /> */}
      <Route path="/transport" element={<Techniques />} />
      <Route path="/cameras" element={<Camera />} />
      <Route path="/integration-monitor" element={<IntegrationMonitor />} />
      <Route path="/production" element={<Production />} />
      <Route path="/sales" element={<Sales />} />
      <Route path="/finance" element={<Finance />} />
      <Route path="/partners" element={<Partners />} />
      <Route path="/applications" element={<Navigate to="/partners?tab=arizalar" replace />} />
      <Route path="/energy" element={<Energy />} />
      <Route path="/esg" element={<ESG />} />
      {/* <Route path="/punkt-esg" element={<ESGPunkt />} /> */}

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
    <Suspense fallback={<PageLoader />}>
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
    </Suspense>
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

            {/* Energy Systems - alohida mustaqil tizimlar */}
            <Route
              path="/meter-operators"
              element={
                <Suspense fallback={<PageLoader />}>
                  <MeterOperators />
                </Suspense>
              }
            />
            <Route
              path="/energy-management"
              element={
                <Suspense fallback={<PageLoader />}>
                  <EnergyManagement />
                </Suspense>
              }
            />

            {/* Asosiy tizim - himoyalangan routes */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    {/* Suspense Layout ichida — sahifa yuklanayotganda sidebar ko'rinib turadi */}
                    <Suspense fallback={<PageLoader />}>
                      <ScopeGuard>
                        <AppRoutes />
                      </ScopeGuard>
                    </Suspense>
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
