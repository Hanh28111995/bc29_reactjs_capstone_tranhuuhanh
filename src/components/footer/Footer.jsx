import React from "react";
import { useTranslation } from "react-i18next";
import "./index.scss";
import logoImage from "../../assets/images/logo_footer.gif";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="moveek-footer">
      <div className="footer_inner">
        {/* Logo */}
        <img src={logoImage} />
        {/* Các liên kết */}
        <ul className="footer_link">
          <li>
            <a href="/membership" title={t("footer.membership")}>
              {t("footer.membership")}
            </a>
          </li>

          <li>
            <a href="/privacy-policy" title={t("footer.privacy")}>
              {t("footer.privacy")}
            </a>
          </li>

          <li>
            <a href="/terms-of-use" title={t("footer.terms")}>
              {t("footer.terms")}
            </a>
          </li>
        </ul>
        {/* Thông tin công ty */}
        <div className="company_info">
          <p>{t("footer.company")}</p>
          <p>{t("footer.businessRegistrationDetails")}</p>
          <p>{t("footer.address")}: {t("footer.addressDetails")}</p>
          <p>{t("footer.hotline")}: (028) 3775 2524</p>
        </div>
        {/* Copyright */}
        <p className="copy">{t("footer.copyright")}</p>        
      </div>
    </footer>
  );
}
