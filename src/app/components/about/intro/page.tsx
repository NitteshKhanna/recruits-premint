'use client';
import { useEffect, useRef, useState } from "react";
import "./intro.scss"

export function Intro() {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const introRef = useRef(null);
  
  useEffect(() => {
    if (window.innerWidth <= 1024) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          
            setIsVisible(entry.isIntersecting);
            // observer.unobserve(entry.target);
          
        });
      }, { threshold: 0.6 }); 
      
      if (introRef.current) {
        observer.observe(introRef.current);
      }
      
      return () => {
        if (introRef.current) {
          observer.unobserve(introRef.current);
        }
      };
    }
  }, []);

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 1024;
  const shouldAnimate = isMobile ? isVisible : isHovered;

  return (
    <div className="intro-container" ref={introRef}>
      <div className="intro-section">
        <div className="image-container"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}>
            <img
              className={`swap-img top-left ${shouldAnimate ? "swapped" : "initial"}`}
              src="/images/about/Group 6 Masked.svg"
              alt="top left image"
            />
            <img
              className={`swap-img bottom-left ${shouldAnimate ? "swapped" : "initial"}`}
              src="/images/about/Group 17 Masked.svg"
              alt="bottom left image"
            />
            <img
              className={`swap-img top-right ${shouldAnimate ? "swapped" : "initial"}`}
              src="/images/about/Group 18 Masked.svg"
              alt="top right image"
            />
        </div>
        <div className={`intro-text ${shouldAnimate ? "hovered" : "default"}`}>
          <h1>Hi, I am Stew</h1>
          <h5>Hello everyone my name is Stew! I have been in the crypto space since 2019 and been a part of NFTs specifically since 2021. With a masters degree in Science Technological Studies, I am  passionate about building things that stand on three main values: communication, innovation, and community. I’ve worked with a few big names in the space to help grow their personal brands and visions, now it is time to grow my own! I have been a lead role in a few projects that have been very successful in their own ecosystems and hope to continue to bring value in the Abstract ecosystem with Recruits!</h5>
        </div>
      </div>
    </div>
  );
}
export default Intro;