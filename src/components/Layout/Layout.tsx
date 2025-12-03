import React, { ReactNode, useState } from "react";
import SidebarComponent from "./SidebarComponent";
import Header from "./Header";
import { useAuth } from "../../contexts/AuthContext";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { role, isAuthenticated } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // If user is viewer, show only content without sidebar
  if (isAuthenticated && role === "viewer") {
    return (
      <div className="rubick before:content-[''] before:bg-gradient-to-b before:from-theme-1 before:to-theme-2 dark:before:from-darkmode-800 dark:before:to-darkmode-800 before:fixed before:inset-0 before:z-[-1]">
        <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="min-h-screen w-full bg-slate-100 dark:bg-darkmode-700 p-4">
          {children}
        </main>
      </div>
    );
  }

  // Default layout with sidebar for admin and user roles
  return (
    <div className="rubick sm:px-2  before:content-[''] before:bg-gradient-to-b before:from-theme-1 before:to-theme-2 dark:before:from-darkmode-800 dark:before:to-darkmode-800 before:fixed before:inset-0 before:z-[-1] flex flex-col">
      {/* <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} /> */}

      <div className="flex flex-1">
        <SidebarComponent />

        <main
          className={`md:max-w-auto min-h-screen min-w-0 max-w-full flex-1 rounded-[30px] bg-slate-100  before:block before:h-px before:w-full before:content-[''] dark:bg-darkmode-700 xl:p-4`}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
