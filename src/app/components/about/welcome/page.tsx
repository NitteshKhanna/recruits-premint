'use client';
import { useEffect } from "react";
import "./welcome.scss"

export function Welcome() {
  useEffect(() => {
    if (window.innerWidth <= 1024) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      }, { threshold: 0.1 });
      
      document.querySelectorAll('.animate-on-mobile').forEach(element => {
        observer.observe(element);
      });
      
      return () => observer.disconnect();
    }
  }, []);
  return (
    <div className="welcome-container">
      <svg
        width="613"
        height="174"
        viewBox="0 0 613 174"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="parallelogram animate-on-mobile"
      >
        <g filter="url(#filter0_d_364_1595)">
          <path
            d="M0 0H564L604 48.5V164H37L0 118V0Z"
            fill="black"
            fillOpacity="0.34"
            shapeRendering="crispEdges"
          />
          <path
            d="M563.764 0.5L603.5 48.6797V163.5H37.2393L0.5 117.823V0.5H563.764Z"
            stroke="white"
            shapeRendering="crispEdges"
          />
        </g>
        <defs>
          <filter
            id="filter0_d_364_1595"
            x="0"
            y="0"
            width="613"
            height="174"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dx="9" dy="10" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0"
            />
            <feBlend
              mode="normal"
              in2="BackgroundImageFix"
              result="effect1_dropShadow_364_1595"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_364_1595"
              result="shape"
            />
          </filter>
        </defs>
        <foreignObject x="10%" y="20%" width="80%" height="60%">
          <div className="textContainer">
            <h3>Welcome to the Grid</h3>
            <p>A digital utopia... but something is breaking.</p>
          </div>
        </foreignObject>
      </svg>
    </div>
  );
}
export default Welcome;