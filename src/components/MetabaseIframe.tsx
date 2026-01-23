import React, { useEffect, useState } from "react";
import axios from "axios";

interface Props {
  title?: string;
  apiPath?: string; // backend endpoint to fetch metabase url (e.g., /metabase-dashboard?name=...)
}

const MetabaseIframe: React.FC<Props> = ({
  title = "Dashboard",
  apiPath = "/metabase-dashboard",
}) => {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchUrl = async () => {
      try {
        const res = await axios.get(apiPath);
        console.log(res);
        
        // expect { url: 'https://...' } or plain string
        const data = res.data;
        const resolved = typeof data === "string" ? data : data?.dashboardUrl;
        if (mounted) setUrl(resolved || null);
      } catch (err) {
        console.error("Failed to load Metabase iframe URL:", err);
        if (mounted) setUrl(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchUrl();
    return () => {
      mounted = false;
    };
  }, [apiPath]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">Loading...</div>
    );
  }

  if (!url) {
    return (
      <div className="p-4 text-center text-sm text-red-500">
        Dashboard URL not available
      </div>
    );
  }

  return (
    <iframe
      src={url}
      title={title}
      className="w-full h-full border-0"
      style={{ minHeight: 600 }}
      allowTransparency
    />
  );
};

export default MetabaseIframe;
