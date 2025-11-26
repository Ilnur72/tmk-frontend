import { useState, useEffect } from "react";

export const useModulesAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      // Modules uchun alohida token keys
      const authToken = localStorage.getItem("modules_auth_token");
      const accessToken = localStorage.getItem("modules_access_token");

      const validToken = authToken || accessToken;

      if (validToken) {
        // Token formatini tekshirish (JWT bo'lsa)
        try {
          const parts = validToken.split(".");
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            const now = Date.now() / 1000;

            // Token muddati tugaganligini tekshirish
            if (payload.exp && payload.exp < now) {
              localStorage.removeItem("modules_auth_token");
              localStorage.removeItem("modules_access_token");
              setIsAuthenticated(false);
              setToken(null);
            } else {
              setIsAuthenticated(true);
              setToken(validToken);
            }
          } else {
            // Oddiy token bo'lsa
            setIsAuthenticated(true);
            setToken(validToken);
          }
        } catch (e) {
          setIsAuthenticated(true); // Xatolik bo'lsa ham tokenni haqiqiy deb hisoblaymiz
          setToken(validToken);
        }
      } else {
        setIsAuthenticated(false);
        setToken(null);
      }

      setIsLoading(false);
    };

    checkAuth();

    // Storage change eventini tinglash (boshqa tab'da token o'zgarsa)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "modules_auth_token" || e.key === "modules_access_token") {
        checkAuth();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const logout = () => {
    localStorage.removeItem("modules_auth_token");
    localStorage.removeItem("modules_access_token");
    localStorage.removeItem("modules_partner_data");
    localStorage.removeItem("modules_user_data");
    localStorage.removeItem("modules_partner_id");
    setIsAuthenticated(false);
    setToken(null);
  };

  return {
    isAuthenticated,
    isLoading,
    token,
    logout,
  };
};
