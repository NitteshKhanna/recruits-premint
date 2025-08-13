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
              <a href="https://x.com/Recruitsworld/">
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
              </a>
              <a href="https://discord.gg/TS4zfPR8rm">
              <div className="icon">
                <div className="box">
                  <svg
                    className="social-icon"
                    width="66"
                    height="66"
                    viewBox="0 0 66 66"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    >
                    <path d="M52.771 15.06C49.1689 13.3929 45.269 12.183 41.2065 11.4839C41.135 11.4849 41.0669 11.5139 41.0169 11.5646C40.5294 12.4519 39.9606 13.608 39.5815 14.4953C35.2725 13.8504 30.8904 13.8504 26.5815 14.4953C26.2023 13.5812 25.6335 12.4519 25.119 11.5646C25.0919 11.5108 25.0106 11.4839 24.9294 11.4839C20.8669 12.183 16.994 13.3929 13.3648 15.06C13.3377 15.06 13.3106 15.0869 13.2835 15.1138C5.91687 26.0572 3.88562 36.7048 4.8877 47.2449C4.8877 47.2987 4.91479 47.3525 4.96895 47.3794C9.84395 50.9286 14.5294 53.0796 19.1606 54.5047C19.2419 54.5316 19.3231 54.5047 19.3502 54.4509C20.4335 52.9721 21.4085 51.4126 22.2481 49.7724C22.3023 49.6648 22.2481 49.5573 22.1398 49.5304C20.596 48.9389 19.1335 48.2398 17.6981 47.4331C17.5898 47.3794 17.5898 47.218 17.671 47.1374C17.969 46.9223 18.2669 46.6803 18.5648 46.4652C18.619 46.4114 18.7002 46.4114 18.7544 46.4383C28.071 50.6597 38.119 50.6597 47.3273 46.4383C47.3815 46.4114 47.4627 46.4114 47.5169 46.4652C47.8148 46.7072 48.1127 46.9223 48.4106 47.1643C48.5189 47.2449 48.5189 47.4062 48.3835 47.46C46.9752 48.2936 45.4856 48.9658 43.9419 49.5573C43.8335 49.5842 43.8065 49.7186 43.8335 49.7993C44.7002 51.4394 45.6752 52.999 46.7315 54.4778C46.8127 54.5047 46.894 54.5316 46.9752 54.5047C51.6335 53.0796 56.3189 50.9286 61.1939 47.3794C61.2481 47.3525 61.2752 47.2987 61.2752 47.2449C62.4669 35.0647 59.2981 24.4977 52.8794 15.1138C52.8523 15.0869 52.8252 15.06 52.771 15.06ZM23.6565 40.8187C20.8669 40.8187 18.5377 38.2643 18.5377 35.1184C18.5377 31.9725 20.8127 29.4182 23.6565 29.4182C26.5273 29.4182 28.8023 31.9994 28.7752 35.1184C28.7752 38.2643 26.5002 40.8187 23.6565 40.8187ZM42.5335 40.8187C39.744 40.8187 37.4148 38.2643 37.4148 35.1184C37.4148 31.9725 39.6898 29.4182 42.5335 29.4182C45.4044 29.4182 47.6794 31.9994 47.6523 35.1184C47.6523 38.2643 45.4044 40.8187 42.5335 40.8187Z" />
                  </svg>
                </div>
                <h2 className="social-name">Discord</h2>
              </div>
                  </a>
                  <a href="https://medium.com/@recruitsworld">
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
                    <path d="M21.8334 16C26.0768 16 30.1465 17.6857 33.1471 20.6863C36.1477 23.6869 37.8334 27.7565 37.8334 32C37.8334 36.2435 36.1477 40.3131 33.1471 43.3137C30.1465 46.3143 26.0768 48 21.8334 48C17.5899 48 13.5202 46.3143 10.5197 43.3137C7.51908 40.3131 5.83337 36.2435 5.83337 32C5.83337 27.7565 7.51908 23.6869 10.5197 20.6863C13.5202 17.6857 17.5899 16 21.8334 16ZM45.8334 18.6667C49.8334 18.6667 52.5 24.6373 52.5 32C52.5 39.3627 49.8334 45.3333 45.8334 45.3333C41.8334 45.3333 39.1667 39.3627 39.1667 32C39.1667 24.6373 41.8334 18.6667 45.8334 18.6667ZM56.5 20C57.5134 20 58.3987 22.2053 58.8467 25.9893L58.972 27.1707L59.0227 27.7973L59.1027 29.1147L59.1294 29.8053L59.1614 31.248L59.1667 32L59.1614 32.752L59.1294 34.1947L59.1027 34.888L59.0227 36.2027L58.9694 36.8293L58.8494 38.0107C58.3987 41.7973 57.516 44 56.5 44C55.4867 44 54.6014 41.7947 54.1534 38.0107L54.028 36.8293L53.9774 36.2027L53.8974 34.8853L53.8707 34.1947L53.8387 32.752V31.248L53.8707 29.8053L53.8974 29.112L53.9774 27.7973L54.0307 27.1707L54.1507 25.9893C54.6014 22.2027 55.484 20 56.5 20Z" />
                  </svg>
                </div>
                <h2 className="social-name">Medium</h2>
              </div>
                    </a>
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
