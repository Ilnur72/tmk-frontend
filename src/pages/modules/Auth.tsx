import React, { useState, useEffect } from "react";
import api from "./services/api";
import "./Auth.css";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  rememberMe: boolean;
}

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [formData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    rememberMe: false,
  });

  // Google OAuth callback code ni handle qilish
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const token = urlParams.get("token");
    const partnerId = urlParams.get("partnerId");

    if (token && partnerId) {
      if (typeof token === "string")
        localStorage.setItem("modules_auth_token", token);
      if (typeof partnerId === "string")
        localStorage.setItem("modules_partner_id", partnerId);
      window.location.href = `/partner-portal/dashboard`;
      return;
    }

    if (code) {
      api
        .post("/partners/auth/google/callback", { code })
        .then((response) => {
          if (response.data) {
            if (response.data.token) {
              localStorage.setItem("modules_auth_token", response.data.token);
            }
            if (response.data.access_token) {
              localStorage.setItem(
                "modules_access_token",
                response.data.access_token
              );
            }
            if (response.data.partner) {
              localStorage.setItem(
                "modules_partner_data",
                JSON.stringify(response.data.partner)
              );
            }
            if (response.data.user) {
              localStorage.setItem(
                "modules_user_data",
                JSON.stringify(response.data.user)
              );
            }
          }
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
          window.location.href = `/partner-portal/dashboard`;
        })
        .catch(() => {
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
        });
    }
  }, []);

  return (
    <div className="auth-container">
      <div className="auth-left">
        <div className="auth-form-container">
          <h1>Your listing details</h1>

          <div className="account-section">
            <div className="account-icon">
              <span>👤</span>
            </div>
            <div className="account-info">
              <h3>Account</h3>
              <p>You must be logged in to post new listings.</p>
            </div>
          </div>

          <div className="auth-tabs">
            <button
              className={isLogin ? "tab active" : "tab"}
              onClick={() => setIsLogin(true)}
              type="button"
            >
              👤 Sign in
            </button>
            <span>or</span>
            <button
              className={!isLogin ? "tab active" : "tab"}
              onClick={() => setIsLogin(false)}
              type="button"
            >
              👤 Register
            </button>
          </div>

          <form className="auth-form">
            <div className="form-header">
              <h2>{isLogin ? "Sign in" : "Register"}</h2>
            </div>

            {!isLogin && (
              <>
                <div className="form-group">
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={() => {}}
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={() => {}}
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={() => {}}
                    required
                  />
                </div>
              </>
            )}

            {isLogin && (
              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={() => {}}
                  required
                />
              </div>
            )}

            <div className="form-group password-group">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={() => {}}
                required
              />
              <span className="password-toggle">👁</span>
            </div>

            {isLogin && (
              <div className="form-options">
                <label className="remember-me">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={() => {}}
                  />
                  Remember me
                </label>
              </div>
            )}

            {!isLogin && (
              <div className="privacy-notice">
                <p>
                  Your personal data will be used to support your experience
                  throughout this website, to manage access to your account, and
                  for other purposes described in our{" "}
                  <button
                    type="button"
                    className="privacy-link"
                    tabIndex={0}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#007bff",
                      textDecoration: "underline",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    privacy policy
                  </button>
                  .
                </p>
              </div>
            )}

            <button type="submit" className="auth-submit-btn">
              👤 {isLogin ? "Sign in" : "Sign Up"}
            </button>

            {isLogin && (
              <div className="forgot-password">
                <button
                  type="button"
                  className="forgot-link"
                  tabIndex={0}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#007bff",
                    textDecoration: "underline",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  🔒 Forgot password?
                </button>
              </div>
            )}

            <div className="divider">
              <span>Or connect with</span>
            </div>

            <div className="google-auth">
              <button
                type="button"
                className="google-signin-btn"
                onClick={() => {
                  // Production server address ishlatish
                  const apiUrl =
                    process.env.REACT_APP_API_URL || "http://localhost:8085";
                  const url = `${apiUrl}/partners/auth/google`;

                  window.location.href = url;
                }}
              >
                <img
                  src="https://developers.google.com/identity/images/g-logo.png"
                  alt="Google"
                />
                Вход через аккаунт Google
              </button>
            </div>
          </form>

          <div className="language-selector">
            <img src="https://flagcdn.com/w20/gb.png" alt="English" />
            <span>English ▼</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
