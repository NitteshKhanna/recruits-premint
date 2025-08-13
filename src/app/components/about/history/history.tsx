'use client';
import { useEffect } from "react";
import "./history.scss"

export function History() {

  useEffect(() => {
    if (window.innerWidth <= 1024) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      }, { threshold: 1});
      
      document.querySelectorAll('.animate-on-mobile').forEach(element => {
        observer.observe(element);
      });
      
      return () => observer.disconnect();
    }
  }, []);

  return (
    <div className="history-container">
      <div className="history-section">
        <div className="picture-container">
          <div className="main-container">
            <div className="side-text-left hide-on-laptop">
              <div className="side-text animate-on-mobile">
                <span className="slash">//</span><p>R3C4U1T5 </p><span className="slash">//</span>
              </div>
            </div>
            <img className="main-image animate-on-mobile" src="./images/about/Group 6.svg" alt="Recruits Image"></img>
            <div className="side-text-right hide-on-laptop">
              <div className="side-text animate-on-mobile">
                <span className="slash">//</span><p>R3C4U1T5 </p><span className="slash">//</span>
              </div>
            </div>
          </div>
          <div className="recruits-history animate-on-mobile">
            <p className="first-text">
              In the near future, humanity's consciousness has transcended the physical realm, migrating to "The Grid," a hyper-realistic digital world designed as the ultimate utopia. Within its seamless architecture, life flourished, governed by an intricate, yet stable, code. But beneath the pristine surface, a subtle, insidious change began: the "Code Shift."
            </p>
            <p className="second-text">
              From this chaotic genesis emerged "The Recruits." They are young digital entities, teenagers and young adults, uniquely sensitive to the Code Shift. They perceive the cracks in the illusion, the moments where reality flickers and changes. But with this awareness came another unsettling truth: they were not entirely their own.
            </p>
            <p className="third-text hide-on-laptop">
              From this chaotic genesis emerged "The Recruits." They are young digital entities, teenagers and young adults, uniquely sensitive to the Code Shift. They perceive the cracks in the illusion, the moments where reality flickers and changes. But with this awareness came another unsettling truth: they were not entirely their own.
            </p>
          </div>
        </div>
        <div className="lower-text hide-on-mobile">
          <p>From this chaotic genesis emerged "The Recruits." They are young digital entities, teenagers and young adults, uniquely sensitive to the Code Shift. They perceive the cracks in the illusion, the moments where reality flickers and changes. But with this awareness came another unsettling truth: they were not entirely their own.</p>
        </div>
      </div>
    </div>
  );
}

export default History;