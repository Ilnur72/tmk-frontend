import React, { ReactNode } from "react";
import SidebarComponent from "./SidebarComponent";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="rubick sm:px-2  before:content-[''] before:bg-gradient-to-b before:from-theme-1 before:to-theme-2 dark:before:from-darkmode-800 dark:before:to-darkmode-800 before:fixed before:inset-0 before:z-[-1] flex">
      <SidebarComponent />

      <main className={`md:max-w-auto min-h-screen min-w-0 max-w-full flex-1 rounded-[30px] bg-slate-100  before:block before:h-px before:w-full before:content-[''] dark:bg-darkmode-700 xl:p-4`}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
