import React, { useState, useEffect } from "react";
import "./PartnerProfile.css";
import { authAPI } from "./services/api";

// Partner type definition - modules uchun
interface Partner {
  id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  avatar?: string;
  firstName?: string;
  lastName?: string;
  status?: string;
  createdAt?: string;
}

const PartnerProfile: React.FC = () => {
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);

        // Avval localStorage dan ma'lumot olishga harakat qilish
        const savedPartnerData = localStorage.getItem("modules_partner_data");
        const savedUserData = localStorage.getItem("modules_user_data");
        const authToken =
          localStorage.getItem("modules_auth_token") ||
          localStorage.getItem("modules_access_token");

        if (savedPartnerData) {
          // localStorage da partner ma'lumotlari mavjud
          const partnerData = JSON.parse(savedPartnerData);
          setPartner(partnerData);
          console.log("Partner ma'lumotlari localStorage dan yuklandi");
        } else if (savedUserData && authToken) {
          // localStorage da user ma'lumotlari mavjud - Partner formatiga o'zgartirish
          const userData = JSON.parse(savedUserData);
          const partnerData: Partner = {
            id: userData.id || userData.googleId || "temp-id",
            name:
              userData.name ||
              `${userData.firstName || ""} ${userData.lastName || ""}`.trim(),
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            avatar: userData.picture || userData.avatar,
            status: "active",
            createdAt: new Date().toISOString(),
          };
          setPartner(partnerData);
          console.log("User ma'lumotlari Partner formatida o'zgartirildi");
        } else {
          // localStorage da ma'lumot yo'q - backend dan olish
          const profileData = await authAPI.getProfile();
          setPartner(profileData);
          console.log("Profile ma'lumotlari backend dan yuklandi");
        }
      } catch (err: any) {
        console.error("Profile fetch error:", err);

        // Agar backend xatoligi bo'lsa va token yo'q bo'lsa, login sahifasiga yo'naltirish
        const authToken =
          localStorage.getItem("modules_auth_token") ||
          localStorage.getItem("modules_access_token");
        if (!authToken) {
          setError("Login talab qilinadi");
          setTimeout(() => {
            window.location.href = `/auth`;
          }, 2000);
        } else {
          setError("Profil ma'lumotlarini yuklab bo'lmadi");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    try {
      // Backend logout API chaqirish
      await authAPI.logout();
    } catch (err) {
      console.error("Logout error:", err);
      // Backend xatolik bo'lsa ham localStorage ni tozalash
    } finally {
      // localStorage ni tozalash
      localStorage.removeItem("modules_auth_token");
      localStorage.removeItem("modules_access_token");
      localStorage.removeItem("modules_partner_data");
      localStorage.removeItem("modules_user_data");
      localStorage.removeItem("partner_id");

      console.log("localStorage tozalandi");

      // Auth sahifasiga redirect
      window.location.href = `/auth`;
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-loading">
          <div className="loading-spinner"></div>
          <p>Profil yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (error || !partner) {
    return (
      <div className="profile-container">
        <div className="profile-error">
          <h2>Xatolik</h2>
          <p>{error || "Profil topilmadi"}</p>
          <button
            onClick={() => window.location.reload()}
            className="retry-btn"
          >
            Qaytadan urinish
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          {partner.avatar ? (
            <img src={partner.avatar} alt="Avatar" className="avatar-img" />
          ) : (
            <div className="avatar-placeholder">
              {(
                partner.firstName?.[0] ||
                partner.name?.[0] ||
                "?"
              ).toUpperCase()}
            </div>
          )}
        </div>

        <div className="profile-info">
          <h1 className="profile-name">
            {partner.firstName && partner.lastName
              ? `${partner.firstName} ${partner.lastName}`
              : partner.name}
          </h1>
          <p className="profile-email">{partner.email}</p>
          <span className={`status-badge status-${partner.status}`}>
            {partner.status === "active"
              ? "Faol"
              : partner.status === "inactive"
              ? "Nofaol"
              : "Kutilmoqda"}
          </span>
        </div>

        <div className="profile-actions">
          <button onClick={handleLogout} className="logout-btn">
            Chiqish
          </button>
        </div>
      </div>

      <div className="profile-details">
        <div className="details-section">
          <h3>Shaxsiy ma'lumotlar</h3>
          <div className="details-grid">
            <div className="detail-item">
              <label>Ism</label>
              <span>{partner.firstName || "Ko'rsatilmagan"}</span>
            </div>
            <div className="detail-item">
              <label>Familiya</label>
              <span>{partner.lastName || "Ko'rsatilmagan"}</span>
            </div>
            <div className="detail-item">
              <label>Email</label>
              <span>{partner.email}</span>
            </div>
            <div className="detail-item">
              <label>Telefon</label>
              <span>{partner.phone || "Ko'rsatilmagan"}</span>
            </div>
            <div className="detail-item">
              <label>Kompaniya</label>
              <span>{partner.company || "Ko'rsatilmagan"}</span>
            </div>
            <div className="detail-item">
              <label>Ro'yxatdan o'tgan sana</label>
              <span>
                {partner.createdAt
                  ? new Date(partner.createdAt).toLocaleDateString("uz-UZ")
                  : "Noma'lum"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerProfile;
