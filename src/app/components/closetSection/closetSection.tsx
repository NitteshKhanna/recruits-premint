"use client";
import React, { useEffect, useRef, useState } from "react";
import "./closetSection.scss";
import Link from "next/link";

export function ClosetSection() {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target); // Run animation only once
        }
      },
      { threshold: 0.3 } // Trigger when 30% of section is visible
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="closetSection" ref={sectionRef}>
      <div className="sec1 flex">
        <div className="subSec1 flex">
          <h3 className="sectionTitle">// 04 //</h3>
          <h3 className="sectionTitle">The Closet</h3>
          <p className="satoshi">Personalize your Recruit by swapping traits!</p>
        </div>
        <div className="subSec2">
          {process.env.NEXT_PUBLIC_ISMINT === "true" ? (
            <button className="closetCTADesktop">
              <a href="/closet">Open your closet</a>
            </button>
          ) : (
            <></>
          )}
        </div>
      </div>
      <div className="sec2 flex">
        <img
          className={`secondaryImg ${isVisible ? "slideOutLeft" : ""}`}
          src="./images/closetSection/placeholderClosetSectionSecondaryImg1.svg"
          alt=""
        />
        <img
          className="primaryImg"
          src="./images/closetSection/placeholderClosetSectionPrimaryImg.svg"
          alt=""
        />
        <img
          className={`secondaryImg ${isVisible ? "slideOutRight" : ""}`}
          src="./images/closetSection/placeholderClosetSectionSecondaryImg2.svg"
          alt=""
        />
      </div>
      <div className="ctaContainer flex">
        {process.env.NEXT_PUBLIC_ISMINT === "true" ? (
          <button className="closetCTAMobile">
            <a href="/closet">Open your closet</a>
          </button>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}

export default ClosetSection;
