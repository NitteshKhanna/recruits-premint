'use client';
import { useEffect, useState } from "react";
import "./choice.scss"

export function Choice() {
  const choices = [
    {
      src: "/images/about/Obedience.svg",
      hoverSrc: "/images/about/Obedience Masked.svg",
      alt: "Choice Image 1",
      name: "Obedience",
    },
    {
      src: "/images/about/Rebellion.svg",
      hoverSrc: "/images/about/Rebellion Masked.svg",
      alt: "Choice Image 2",
      name: "Rebellion",
    }
  ];
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

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
    <div className="choice-container">
      <div className="choice-section">
        <h1 className="choice-heading animate-on-mobile">What will you choose?</h1>
        <div className="choice-grid">
          {choices.map((choice, index) => (
            <div className="choice"
              key={index}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}>

              <img className="choice-img animate-on-mobile" src={hoveredIndex === index ? choice.hoverSrc : choice.src} alt={choice.alt} />
              <h5 className="choice-name animate-on-mobile">{choice.name}</h5>  
            </div>
          ))}
        </div>
        <div className="choice-description animate-on-mobile">
          <h5>The Recruits were faced with a profound choice: to accept their role as controlled entities, puppets of the Observers, or to rebel, to break free from the Script and assert their own agency. Some sought to please their Observers, finding comfort in the structure provided. Others sought to anger them, testing the limits of their control. Some tried to learn how to edit the interface, to manipulate the gear in ways not intended.</h5>
        </div>
      </div>
    </div>
  );
}

export default Choice;