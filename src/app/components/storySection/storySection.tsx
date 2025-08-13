'use client'
import React, { useRef, useEffect } from "react";
import "./storySection.scss";

export function StorySection() {
  const typingRef = useRef<HTMLSpanElement | null>(null);
  const hasRunRef = useRef(false); // prevents re-running in strict mode

  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    const txt =
      "In the near future, humanity's consciousness has transcended the physical realm, migrating to 'The Grid,' a hyper-realistic digital world designed as the ultimate utopia. Within its seamless architecture, life flourished, governed by an intricate, yet stable, code. But beneath the pristine surface, a subtle, insidious change began: the 'Code Shift.'";

    let i = 0;
    const speed = 75;

    const typeWriter = () => {
      if (i < txt.length && typingRef.current) {
        typingRef.current.innerHTML += txt.charAt(i);
        i++;
        setTimeout(typeWriter, speed);
      }
    };

    if (typingRef.current) {
      typingRef.current.innerHTML = "";
      typeWriter();
    }
  }, []);

  return (
    <div className="storySection" id="storySection">
      <div className="sec1 flex">
        <img src="./images/storySection/verticalRecruitsLogoline.svg" alt="" />
        <img className="storySectionImg" src="./images/storySection/storySectionImg.svg" alt="" />
        <img src="./images/storySection/verticalRecruitsLogoline.svg" alt="" />
      </div>
      <div className="sec2 flex">
        <h3 className="sectionTitle">
          // 02 // <br /> The Story
        </h3>
        <p>
          <span className="typewriter" ref={typingRef}></span>
        </p>
      </div>
    </div>
  );
}

export default StorySection;
