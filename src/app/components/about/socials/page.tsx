"use client";
import { useEffect, useState } from "react";
import "./socials.scss";
import { usePathname } from "next/navigation";

export function Socials() {
  let pathArr = usePathname().split("/");
  let pageName = pathArr[pathArr.length - 1].toLowerCase();
  let [isAbout, setIsAbout] = useState(false);
  useEffect(() => {
    setIsAbout(pageName.toLowerCase() == "about");
  });
  return (
    <div className={`socials-container ${isAbout ? "aboutSocials" : ""}`}>
      <div className="socials-section">
        <div className="wings hide-on-mobile">
          <img src="/images/header/left wing.svg" alt="left wing" />
          <img src="/images/header/right wing.svg" alt="right wing" />
        </div>
        <div className="main-container">
          <div className="side-text-left hide-on-mobile">
            <span className="slash">//</span>
            <p>R3C4U1T5 </p>
            <span className="slash">//</span>
          </div>
          <div className="community-section">
            <h2>Join The Community</h2>
            <h5>Join the Cause Today</h5>
            <div className="icons">
              <div className="icon">
                <div className="box">
                  <svg
                    className="social-icon"
                    width="65"
                    height="64"
                    viewBox="0 0 65 64"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <mask
                      id="mask0_891_262"
                      maskUnits="userSpaceOnUse"
                      x="7"
                      y="6"
                      width="53"
                      height="53"
                    >
                      <path d="M7 6.5H59.5V59H7V6.5Z" fill="white" />
                    </mask>
                    <g mask="url(#mask0_891_262)">
                      <path d="M48.3438 8.95996H56.395L38.8075 29.1125L59.5 56.54H43.3L30.6025 39.9087L16.09 56.54H8.03125L26.8412 34.9775L7 8.96371H23.6125L35.0725 24.1625L48.3438 8.95996ZM45.5125 51.71H49.975L21.175 13.5387H16.39L45.5125 51.71Z" />
                    </g>
                  </svg>
                </div>
                <h2 className="social-name">X</h2>
              </div>
            </div>
          </div>
          <div className="side-text-right hide-on-mobile">
            <span className="slash">//</span>
            <p>R3C4U1T5 </p>
            <span className="slash">//</span>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Socials;
