import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { energyService } from "../../../services/energyService";
import { toast } from "../../../utils/toast";
import { User as UserIcon, Lock, LogIn } from "lucide-react";
import { User } from "../../../types/energy";

interface OperatorLoginProps {
  onLogin: (userData: User) => void;
}

const OperatorLogin: React.FC<OperatorLoginProps> = ({ onLogin }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setIsLoading(true);
      const result = await energyService.operatorLogin(email, password);

      if (result.success) {
        toast.success("Login successful");
        onLogin(result.operator);
      } else {
        toast.error(result.message || "Login failed");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error("Login failed. Please check your credentials.");
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
            Meter Operator Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to record meter readings
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="relative">
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <UserIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10"
                placeholder="Password"
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
                  Sign in
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
