import React, { useState } from "react";
import { energyManagementService } from "../services/energyManagementService";
import { toast } from "react-toastify";
import { User as UserIcon, Lock, LogIn, Settings } from "lucide-react";
import { User } from "../../../types/energy";

interface AdminLoginProps {
  onLogin: (userData: User) => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  // const { t } = useTranslation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("Barcha maydonlarni to'ldiring");
      return;
    }

    try {
      setLoading(true);
      const result = await energyManagementService.login(username, password);

      toast.success("Muvaffaqiyatli kirildi!");
      onLogin(result);
    } catch (error: any) {
      console.error("Login error:", error);
      if (error?.response?.status === 401) {
        toast.error(
          "Login yoki parol noto'g'ri! Admin huquqingizni tekshiring."
        );
      } else if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Serverga ulanishda xatolik. Qaytadan urinib ko'ring.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <Settings className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Energy Management System
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Administrator access required
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  className="relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Admin username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <LogIn className="h-5 w-5 text-blue-500 group-hover:text-blue-400" />
              </span>
              {loading ? "Signing in..." : "Sign in to Management"}
            </button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Energy Management System - Restricted Access
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
