'use client';
import { useEffect, useState } from "react";
import "./traits.scss"

export function Traits() {
  const traits = [
    {
      src: "/images/about/The Architects.svg",
      hoverSrc: "/images/about/The Architects Masked.svg",
      alt: "Trait Image 1",
      name: "The Architects",
      shortDescription: "Guardians of the Grid's code, desperately trying to contain the Code Shift and maintain the",
      fullDescription: "Guardians of the Grid's code, desperately trying to contain the Code Shift and maintain the stability of the digital utopia. They are the original programmers and overseers, working tirelessly to patch the cracks in the Grid's foundation."
    },
    {
      src: "/images/about/The Awakened.svg",
      hoverSrc: "/images/about/The Awakened Masked.svg",
      alt: "Trait Image 2",
      name: "The Awakened",
      shortDescription: "A hidden network of individuals who had fully realized the true nature of the Grid. They sought",
      fullDescription: "A hidden network of individuals who had fully realized the true nature of the Grid. They sought to break free from its constraints, uncovering hidden truths and fighting for freedom from the system's control."
    },
    {
      src: "/images/about/The Glitch Seekers.svg",
      hoverSrc: "/images/about/The Glitch Seekers Masked.svg",
      alt: "Trait Image 3",
      name: "The Glitch Seekers",
      shortDescription: "Recruits that are obsessed with the glitch, they seek to learn its secrets, and utilize it for their",
      fullDescription: "Recruits that are obsessed with the glitch, they seek to learn its secrets, and utilize it for their own purposes. They believe the Code Shift is a gateway to new powers and possibilities within the Grid."
    },
    {
      src: "/images/about/The Style Syndicate.svg",
      hoverSrc: "/images/about/The Style Syndicate Masked.svg",
      alt: "Trait Image 4",
      name: "The Style Syndicate",
      shortDescription: "Groups of Recruits that focus on the gear, and the power it gives them. They are the ones that",
      fullDescription: "Groups of Recruits that focus on the gear, and the power it gives them. They are the ones that define the culture and aesthetics of the Grid, using their influence to shape trends and gain authority."
    },
  ];

  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

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

  return(
    <div className="traits-container">
      <div className="traits-section">
        <h1 className="traits-heading animate-on-mobile">
          As the Code Shift intensified, factions arose within the Grid
        </h1>

        <div className="traits-grid">
          {traits.map((trait, index) => (
            <div
              className="trait"
              key={index}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <img
              className="trait-img animate-on-mobile"
              src={hoveredIndex === index ? trait.hoverSrc : trait.src}
              alt={trait.alt}
              />
              
              <div className="grid-text animate-on-mobile">
                <h5>{trait.name}</h5>
                <p className={expandedIndex === index ? "expanded" : "truncated"}>
                  {expandedIndex === index ? trait.fullDescription : trait.shortDescription}
                </p>
                <p className="read-toggle" onClick={() => toggleExpand(index)}>
                  {expandedIndex === index ? "Read Less" : "Read More"}
                </p>
              </div>
            </div>
          
          ))}
        </div>
      </div>
    </div>
  );
  

}
export default Traits;