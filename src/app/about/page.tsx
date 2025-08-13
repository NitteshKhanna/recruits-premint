"use client";
import { useEffect } from "react";
import Choice from "../components/about/choice/page";
import History from "../components/about/history/page";
import Intro from "../components/about/intro/page";
import Socials from "../components/about/socials/page";
import Traits from "../components/about/traits/page";
import Welcome from "../components/about/welcome/page";
import "./about.scss";

export function About() {
  useEffect(() => {
    if (window.innerWidth <= 1024) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible");
            }
          });
        },
        { threshold: 0.1 }
      );

      document.querySelectorAll(".animate-on-mobile").forEach((element) => {
        observer.observe(element);
      });

      return () => observer.disconnect();
    }
  }, []);

  return (
    <div className="about-container footerPadding">
      <Welcome />
      <History />
      <div className="center-image animate-on-mobile">
        <img
          src="./images/about/Group 16.svg"
          alt="Center Image"
          className="image"
        />
      </div>
      <Traits />
      <Choice />
      <Intro />
      <Socials />
    </div>
  );
}

export default About;
