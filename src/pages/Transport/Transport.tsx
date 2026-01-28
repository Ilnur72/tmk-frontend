import React from "react";
import "./Transport.css";

const Transport: React.FC = () => {
  return (
    <div className="transport-container">
      {/* <div className="">
        <h1>Transport Monitoring</h1>
        <p>Wialon Transport Boshqaruv Tizimi</p>
      </div> */}
      <div className="transport-iframe-wrapper">
        <iframe
          src="https://3.wialon.uz/?lang=uz"
          title="Wialon Transport Monitoring"
          className="transport-iframe"
          allow="geolocation; fullscreen"
          loading="lazy"
        />
      </div>
    </div>
  );
};

export default Transport;
