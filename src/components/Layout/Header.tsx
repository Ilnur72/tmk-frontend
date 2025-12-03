import React from "react";
import LanguageSwitcher from "../UI/LanguageSwitcher";

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = () => {
  return (
    <div className="fixed top-4 right-4 z-50">
      <LanguageSwitcher />
    </div>
  );
};

export default Header;
