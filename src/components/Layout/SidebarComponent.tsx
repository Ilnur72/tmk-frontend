import { useState, useMemo } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Briefcase,
  GitPullRequest,
  BarChart,
  BarChart2,
  Users,
  Codepen,
  Settings,
  Camera,
  LogOut,
  Menu,
  X,
  MapPin,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";

const allMenuItems = [
  { href: "/dashboard", icon: Home, title: "sidebar.dashboard" },
  { href: "/factory-map", icon: MapPin, title: "sidebar.map" },
  { href: "/factory", icon: Briefcase, title: "sidebar.factory" },
  { href: "/production", icon: GitPullRequest, title: "sidebar.production" },
  { href: "/sales", icon: BarChart, title: "sidebar.sales" },
  { href: "/finance", icon: BarChart2, title: "sidebar.finance" },
  { href: "/employers", icon: Users, title: "sidebar.employee" },
  { href: "/techniques", icon: Codepen, title: "sidebar.techniques" },
  { href: "/partners", icon: MapPin, title: "sidebar.partners" },
  {
    href: "/applications",
    icon: GitPullRequest,
    title: "sidebar.applications",
  },
  {
    href: "/energy",
    icon: BarChart,
    title: "sidebar.energy",
  },
  {
    href: "/setting",
    icon: Settings,
    title: "sidebar.setting",
    id: "setting-menu-item",
    roles: ["admin", "editor"], // Only admin and editor can see settings
  },
  { href: "/cameras", icon: Camera, title: "sidebar.cameras" },
];

const Sidebar = () => {
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { logout, role } = useAuth();
  const location = useLocation();
  // Filter menu items based on user role
  const menuItems = useMemo(() => {
    if (role === "viewer") {
      // Viewer can only see dashboard, factory and map
      return allMenuItems.filter(
        (item) =>
          item.href === "/dashboard" ||
          item.href === "/factory-map" ||
          item.href === "/factory"
      );
    }

    return allMenuItems.filter((item) => {
      if (item.roles) {
        return item.roles.includes(role || "user");
      }
      return true;
    });
  }, [role]);
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      {/* Mobile Menu Header */}
      <div className="mobile-menu group top-0 inset-x-0 fixed bg-primary backdrop-blur-sm z-[60] border-b border-white/[0.08] md:hidden">
        <div className="flex h-[45px] items-center px-3 sm:px-8">
          <a className="mr-auto flex" href="/">
            <img
              className="w-16"
              src="/image/logo-full-w.png"
              alt={t("sidebar.logo_alt")}
            />
          </a>
          <button
            className="mobile-menu-toggler p-1"
            onClick={toggleMobileMenu}
            type="button"
            aria-label={t("sidebar.menu_toggle")}
          >
            <Menu className="h-8 w-8 text-white" />
          </button>
        </div>

        {/* Mobile Menu Sidebar */}
        <div
          className={`fixed h-screen z-20 top-0 left-0 w-[270px] bg-primary transition-all duration-300 ease-in-out transform ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between h-14 px-4 border-b border-white">
            <img className="h-8" src="/image/logo-full-w.png" alt="TMK" />

            <button
              onClick={() => closeMobileMenu()}
              className={` p-1 transition-opacity duration-200 ease-in-out ${
                isMobileMenuOpen ? "visible opacity-100" : "invisible opacity-0"
              }`}
              type="button"
              aria-label={t("sidebar.close_menu")}
            >
              <X className="h-8 w-8 text-white" />
            </button>
          </div>

          <ul className="py-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                location.pathname.startsWith(item.href) ||
                location.pathname.replace(/\/$/, "") ===
                  item.href.replace(/\/$/, "");
              return (
                <li
                  key={`mobile-${item.href}`}
                  id={item.id ? `${item.id}-mobile` : undefined}
                >
                  <NavLink
                    to={item.href}
                    onClick={() => closeMobileMenu()}
                    className={({ isActive }) =>
                      `menu flex items-center px-6 py-4 hover:bg-opacity-50 transition-colors ${
                        isActive ? "bg-white border-r-4 border-primary" : ""
                      }`
                    }
                    end={item.href === "/"}
                  >
                    <div
                      className={`menu__icon mr-4 ${
                        isActive ? "text-primary" : "text-white"
                      }`}
                    >
                      <Icon className={`w-5 h-5`} />
                    </div>
                    <div
                      className={`menu__title text-sm font-medium ${
                        isActive ? "text-black" : "text-white"
                      }`}
                    >
                      {t(item.title)}
                    </div>
                  </NavLink>
                </li>
              );
            })}
            <li>
              <div
                className={`menu flex items-center  py-4 hover:bg-opacity-50 transition-colors `}
                onClick={() => handleLogout()}
              >
                <div className={`menu__icon mr-4 `}>
                  <LogOut className={`w-5 h-5`} />
                </div>
                <div className={`menu__title text-sm font-medium `}>
                  {t("sidebar.logout")}
                </div>
              </div>
            </li>
          </ul>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-10"
            onClick={() => closeMobileMenu()}
          />
        )}
      </div>

      {/* Desktop Sidebar */}
      <nav className="side-nav hidden w-[80px] overflow-x-hidden  pr-5 md:block xl:w-[230px]">
        <a className="flex items-center pt-4 pl-5 intro-x" href="/">
          <img
            className="w-42"
            src="/image/logo-full-w.png"
            alt={t("sidebar.logo_alt")}
          />
        </a>
        <div className="my-3 side-nav__divider"></div>
        <ul>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname.startsWith(item.href) ||
              location.pathname.replace(/\/$/, "") ===
                item.href.replace(/\/$/, "");
            return (
              <li key={item.href} id={item.id}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    isActive ? "side-menu side-menu--active" : "side-menu"
                  }
                  end={item.href === "/"}
                  onClick={() => closeMobileMenu()}
                >
                  <div className="side-menu__icon">
                    <Icon className={`stroke-1.5 w-5 h-5`} />
                  </div>
                  <div className="side-menu__title">{t(item.title)}</div>
                </NavLink>
              </li>
            );
          })}
          <li>
            <div className={`side-menu`} onClick={() => handleLogout()}>
              <div className={`side-menu__icon `}>
                <LogOut className={`stroke-1.5 w-5 h-5 rotate-180`} />
              </div>
              <div className={`side-menu__title`}>{t("sidebar.logout")}</div>
            </div>
          </li>
        </ul>
      </nav>
    </>
  );
};

export default Sidebar;
