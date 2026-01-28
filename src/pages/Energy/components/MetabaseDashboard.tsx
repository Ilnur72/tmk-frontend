import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { API_URL } from "../../../config/const";
import { Loader2, AlertCircle } from "lucide-react";

const MetabaseDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [dashboardUrl, setDashboardUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardUrl = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_URL}/metabase-dashboard`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Assuming API returns { url: "..." } or just the URL string
        let url = typeof data === 'string' ? data : data.url || data.dashboardUrl;
        
        if (!url) {
          throw new Error("Dashboard URL not found in response");
        }

        // Fix Mixed Content issue: Convert HTTP to HTTPS if current page is HTTPS
        if (window.location.protocol === 'https:' && url.startsWith('http://')) {
          console.warn('Converting HTTP URL to HTTPS to avoid Mixed Content error');
          url = url.replace('http://', 'https://');
        }

        setDashboardUrl(url);
      } catch (err) {
        console.error("Error fetching Metabase dashboard:", err);
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardUrl();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">{t("energy.metabase.loading")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t("energy.metabase.failed_to_load")}
          </h3>
          <p className="text-gray-600 mb-4">{t("energy.metabase.error_message")}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t("energy.metabase.retry")}
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardUrl) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <p className="text-gray-600">{t("energy.metabase.no_url")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-200px)] w-full">
      <iframe
        src={dashboardUrl}
        title="Metabase Dashboard"
        className="w-full h-full border-0"
        allow="fullscreen"
      />
    </div>
  );
};

export default MetabaseDashboard;
