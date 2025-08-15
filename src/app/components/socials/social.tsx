"use client";
import React from "react";
import "./socials.scss";
import Link from "next/link";
import socialsJSON from "../../data/socials.json";

export function Socials() {
  return (
    <div className="socials-container">
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
              {socialsJSON.map((social,index) => (
                <div className="icon" title={social.name} key={index}>
                  <a href={social.link}>
                    <div className="box flex">
                      <img src={social.imageUrlBig} alt={social.name} />
                    </div>
                    <h2 className="social-name">{social.name}</h2>
                  </a>
                </div>
              ))}
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
