import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "./services/api";
import "./Auth.css";
import { API_URL } from "../../config/const";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();
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
      navigate("/partner-portal/dashboard");
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
          navigate("/partner-portal/dashboard");
        })
        .catch((err) => {
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
          toast.error(err?.response?.data?.message || "Google auth failed");
        });
    }
  }, [navigate]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Form submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        // Login
        const resp = await api.post("/partners/auth/login", {
          email: formData.email,
          password: formData.password,
        });
        if (resp.data?.token) {
          localStorage.setItem("modules_auth_token", resp.data.token);
        }
        if (resp.data?.partner) {
          localStorage.setItem(
            "modules_partner_data",
            JSON.stringify(resp.data.partner)
          );
        }
        navigate("/partner-portal/dashboard");
      } else {
        // Register
        console.log("Registering with data:", formData);

        const resp = await api.post("/partners/auth/register", {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        });
        if (resp.data?.token) {
          localStorage.setItem("modules_auth_token", resp.data.token);
        }
        if (resp.data?.partner) {
          localStorage.setItem(
            "modules_partner_data",
            JSON.stringify(resp.data.partner)
          );
        }
        navigate("/partner-portal/dashboard");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Auth failed");
    }
  };

  return (
    <div className="auth-container">
      <ToastContainer position="top-center" autoClose={3000} />
      <div className="auth-left">
        <div className="auth-form-container">
          <h1>{t("account")}</h1>

          <div className="account-section">
            <div className="account-icon">
              <span>👤</span>
            </div>
            <div className="account-info">
              <h3>{t("account")}</h3>
              <p>{t("you_must_be_logged_in")}</p>
            </div>
          </div>

          <div className="auth-tabs">
            <button
              className={isLogin ? "tab active" : "tab"}
              onClick={() => setIsLogin(true)}
              type="button"
            >
              👤 {t("sign_in")}
            </button>
            <span>{t("or")}</span>
            <button
              className={!isLogin ? "tab active" : "tab"}
              onClick={() => setIsLogin(false)}
              type="button"
            >
              👤 {t("sign_up")}
            </button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-header">
              <h2>{isLogin ? t("sign_in") : t("sign_up")}</h2>
            </div>

            {!isLogin && (
              <>
                <div className="form-group">
                  <input
                    type="text"
                    name="firstName"
                    placeholder={t("first_name")}
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    name="lastName"
                    placeholder={t("last_name")}
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="email"
                    name="email"
                    placeholder={t("email")}
                    value={formData.email}
                    onChange={handleInputChange}
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
                  placeholder={t("email")}
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            )}

            <div className="form-group password-group">
              <input
                type="password"
                name="password"
                placeholder={t("password")}
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              <span className="password-toggle">👁</span>
            </div>

            {!isLogin && (
              <div className="privacy-notice">
                <p>{t("privacy_policy")}</p>
              </div>
            )}

            <button type="submit" className="auth-submit-btn">
              👤 {isLogin ? t("sign_in") : t("sign_up")}
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
                  🔒 {t("forgot_password")}
                </button>
              </div>
            )}

            <div className="divider">
              <span>{t("or_connect_with")}</span>
            </div>

            <div className="google-auth">
              <button
                type="button"
                className="google-signin-btn"
                onClick={() => {
                  // Production server address ishlatish
                  const apiUrl = API_URL || "http://localhost:8085";
                  const url = `${apiUrl}/partners/auth/google`;

                  window.location.href = url;
                }}
              >
                <img
                  src="https://developers.google.com/identity/images/g-logo.png"
                  alt="Google"
                />
                {t("google_signin")}
              </button>
            </div>
          </form>

          <div className="language-selector">
            <button
              onClick={() => i18n.changeLanguage("en")}
              style={{ marginRight: 8 }}
            >
              {t("english")}
            </button>
            <button
              onClick={() => i18n.changeLanguage("ru")}
              style={{ marginRight: 8 }}
            >
              {t("russian")}
            </button>
            <button onClick={() => i18n.changeLanguage("uz")}>
              {t("uzbek")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
