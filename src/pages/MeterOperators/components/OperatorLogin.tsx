import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { meterOperatorService } from "../services/meterOperatorService";
import { toast } from "react-toastify";
import { User as UserIcon, Lock, LogIn } from "lucide-react";
import { User } from "../../../types/energy";

interface OperatorLoginProps {
  onLogin: (userData: User) => void;
}

const OperatorLogin: React.FC<OperatorLoginProps> = ({ onLogin }) => {
  const { t } = useTranslation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error(t("meter_operators.readings.required_fields"));
      return;
    }

    try {
      setIsLoading(true);
      const result = await meterOperatorService.login(username, password);

      toast.success(t("meter_operators.readings.reading_saved"));
      onLogin(result);
    } catch (error: any) {
      console.error("Login error:", error);
      if (error?.response?.status === 401) {
        toast.error(t("meter_operators.login.invalid_credentials"));
      } else if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(t("meter_operators.login.login_failed"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <LogIn className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t("meter_operators.login.title")}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t("meter_operators.login.subtitle")}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="relative">
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <UserIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10"
                placeholder={t("meter_operators.login.email")}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                {t("meter_operators.login.password")}
              </label>
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10"
                placeholder={t("meter_operators.login.password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <LogIn className="h-5 w-5 mr-2" />
                  {t("meter_operators.login.login_button")}
                </>
              )}
            </button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            <p>Test credentials:</p>
            <p>Email: operator1.нурликонлитийкони@tmk.uz</p>
            <p>Password: operator123</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OperatorLogin;
