import React, { useState } from "react";
import { NavLink } from "react-router-dom";

const menuItems = [
  {
    href: "/map",
    icon: "home",
    title: "Лойиҳалар ҳаритаси",
  },
  {
    href: "/factory/",
    icon: "Briefcase",
    title: "Инвестиция лойиҳалари",
  },
  {
    href: "/production/",
    icon: "Git-Pull-Request",
    title: "Ишлаб чиқариш",
  },
  {
    href: "/sales/",
    icon: "Bar-Chart",
    title: "Сотув кўрсаткичлари",
  },
  {
    href: "/finance/",
    icon: "Bar-Chart2",
    title: "Молиявий кўрсаткичлар",
  },
  {
    href: "/employers/",
    icon: "Users",
    title: "Ходимлар",
  },
  {
    href: "/techniques/",
    icon: "Codepen",
    title: "Техникалар",
  },
  {
    href: "/setting",
    icon: "settings",
    title: "Параметр",
    id: "setting-menu-item",
  },
  {
    href: "/cameras",
    icon: "Camera",
    title: "Камералар",
  },
  {
    href: "/login",
    icon: "log-out",
    title: "Тизимдан чиқиш",
    rotate: true,
  },
];

const SidebarComponent: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu */}
      <div
        className={`mobile-menu group top-0 inset-x-0 fixed bg-theme-1/90 z-[60] border-b border-white/[0.08] dark:bg-darkmode-800/90 md:hidden
          before:content-[''] before:w-full before:h-screen before:z-10 before:fixed before:inset-x-0 before:bg-black/90 before:transition-opacity before:duration-200 before:ease-in-out before:invisible before:opacity-0
          ${
            mobileOpen
              ? "mobile-menu--active before:visible before:opacity-100"
              : ""
          }
        `}
        style={{ display: mobileOpen ? "block" : "none" }}
      >
        <div className="flex h-[45px] items-center px-3 sm:px-8">
          <a className="mr-auto flex" href="/">
            <img className="w-16" src="/image/logo-full-w.png" alt="TMK" />
          </a>
          <button
            className="mobile-menu-toggler"
            onClick={() => setMobileOpen(false)}
          >
            <i
              data-tw-merge=""
              data-lucide="x-circle"
              className="stroke-1.5 h-8 w-8 -rotate-90 transform text-white"
            ></i>
          </button>
        </div>
        <div className="scrollable h-screen z-20 top-0 left-0 w-[270px] -ml-[100%] bg-primary transition-all duration-300 ease-in-out dark:bg-darkmode-800 group-[.mobile-menu--active]:ml-0">
          <ul className="py-2">
            {menuItems.map((item) => (
              <li
                key={item.href}
                id={
                  item.id === "setting-menu-item"
                    ? "setting-menu-item-mobile"
                    : undefined
                }
              >
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    `menu${isActive ? " menu--active" : ""}`
                  }
                  onClick={() => setMobileOpen(false)}
                  end={item.href === "/"}
                >
                  <div className="menu__icon">
                    <i
                      data-tw-merge=""
                      data-lucide={item.icon}
                      className={`stroke-1.5 w-5 h-5${
                        item.rotate ? " rotate-180" : ""
                      }`}
                    ></i>
                  </div>
                  <div className="menu__title">{item.title}</div>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Mobile menu toggler button */}
      <button
        className="fixed top-4 left-4 z-[70] md:hidden bg-theme-1 text-white rounded-full p-2 shadow-lg"
        onClick={() => setMobileOpen(true)}
        style={{ display: mobileOpen ? "none" : "block" }}
        aria-label="Open menu"
      >
        <i
          data-tw-merge=""
          data-lucide="bar-chart2"
          className="stroke-1.5 h-8 w-8 -rotate-90 transform"
        ></i>
      </button>

      {/* Desktop Sidebar */}
      <nav className="side-nav hidden w-[80px] overflow-x-hidden pb-16 pr-5 md:block xl:w-[230px]">
        <a className="flex items-center pt-4 pl-5 intro-x" href="/">
          <img className="w-42" src="/image/logo-full-w.png" alt="TMK" />
        </a>
        <div className="my-6 side-nav__divider"></div>
        <ul>
          {menuItems.map((item) => (
            <li key={item.href} id={item.id}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  `side-menu${isActive ? " side-menu--active" : ""}`
                }
                end={item.href === "/"}
              >
                <div className="side-menu__icon">
                  <i
                    data-tw-merge=""
                    data-lucide={item.icon}
                    className={`stroke-1.5 w-5 h-5${
                      item.rotate ? " rotate-180" : ""
                    }`}
                  ></i>
                </div>
                <div className="side-menu__title">{item.title}</div>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
};

export default SidebarComponent;
