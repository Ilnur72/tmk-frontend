import React from "react";
import { NavLink } from "react-router-dom";

const menuItems = [
  {
    href: "/",
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

const Sidebar: React.FC = () => {
  return (
    <nav className="side-nav hidden w-[80px] overflow-x-hidden pb-16 pr-5 md:block xl:w-[230px]">
      <a className="flex items-center pt-4 pl-5 intro-x" href="">
        <img
          className="w-42"
          src={require("../../../public/image/logo-full-w.png")}
          alt="TMK"
        />
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
  );
};

export default Sidebar;
