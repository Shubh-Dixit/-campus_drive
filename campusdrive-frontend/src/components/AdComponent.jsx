import React, { useEffect } from 'react';

/**
 * Componente para mostrar anuncios de Google AdSense.
 * Asegúrate de reemplazar "YOUR_CLIENT_ID" y "YOUR_AD_SLOT_ID".
 */
const AdComponent = ({ className = '', style = {} }) => {
  useEffect(() => {
    try {
      if (window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, []);

  return (
    <div className={`google-ad-container ${className}`} style={{ margin: '1.5rem 0', textAlign: 'center', ...style }}>
      {/* 
        Reemplaza 'ca-pub-XXXXXXXXXXXXXXXX' con tu publisher ID.
        Reemplaza 'XXXXXXXXXX' con el ID del bloque de anuncios.
      */}
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
        data-ad-slot="XXXXXXXXXX"
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
};

export default AdComponent;
