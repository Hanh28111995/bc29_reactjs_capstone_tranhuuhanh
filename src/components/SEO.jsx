import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords, image, url }) => {
  const siteTitle = "Movie Cybersoft";
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  
  // Hàm cắt ngắn mô tả để tối ưu SEO (giới hạn ~160 ký tự)
  const truncateDescription = (str, maxLength = 160) => {
    if (!str) return "";
    if (str.length <= maxLength) return str;
    return str.substring(0, str.lastIndexOf(" ", maxLength)) + "...";
  };

  const defaultDescription = "Hệ thống đặt vé xem phim trực tuyến hàng đầu Việt Nam. Xem lịch chiếu, đặt vé nhanh chóng, tiện lợi.";
  const metaDescription = truncateDescription(description) || defaultDescription;
  const siteUrl = window.location.origin;
  const metaImage = image || `https://cybersoft.edu.vn/wp-content/uploads/2017/04/MAX-OP1.png`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      {keywords && <meta name="keywords" content={keywords} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url || window.location.href} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url || window.location.href} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={metaDescription} />
      <meta property="twitter:image" content={metaImage} />
    </Helmet>
  );
};

export default SEO;
