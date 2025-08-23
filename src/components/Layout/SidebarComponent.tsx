import React from "react";
import { NavLink } from "react-router-dom";
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
} from "lucide-react";

const menuItems = [
  { href: "/map", icon: Home, title: "Лойиҳалар ҳаритаси" },
  { href: "/factory/", icon: Briefcase, title: "Инвестиция лойиҳалари" },
  { href: "/production/", icon: GitPullRequest, title: "Ишлаб чиқариш" },
  { href: "/sales/", icon: BarChart, title: "Сотув кўрсаткичлари" },
  { href: "/finance/", icon: BarChart2, title: "Молиявий кўрсаткичлар" },
  { href: "/employers/", icon: Users, title: "Ходимлар" },
  { href: "/techniques/", icon: Codepen, title: "Техникалар" },
  {
    href: "/setting",
    icon: Settings,
    title: "Параметр",
    id: "setting-menu-item",
  },
  { href: "/cameras", icon: Camera, title: "Камералар" },
  { href: "/login", icon: LogOut, title: "Тизимдан чиқиш", rotate: true },
];

const Sidebar: React.FC = () => {
  return (
    <nav className="side-nav hidden w-[80px] overflow-x-hidden pb-16 pr-5 md:block xl:w-[230px]">
      <a className="flex items-center pt-4 pl-5 intro-x" href="/map">
        <img className="w-42" src={"/image/logo-full-w.png"} alt="TMK" />
      </a>
      <div className="my-6 side-nav__divider"></div>
      <ul>
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.href} id={item.id}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  `side-menu${isActive ? " side-menu--active" : ""}`
                }
                end={item.href === "/"}
              >
                <div className="side-menu__icon">
                  <Icon
                    className={`stroke-1.5 w-5 h-5${
                      item.rotate ? " rotate-180" : ""
                    }`}
                  />
                </div>
                <div className="side-menu__title">{item.title}</div>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Sidebar;
