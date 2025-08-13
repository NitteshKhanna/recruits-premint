import React from "react";
import "./heroSection.scss";
import Carousel from "../carousel/carousel";

export function HeroSection() {
  return (
    <div className="heroSectionContainer flex">
      <div className="heroSection">
        <div className="gradientOverlay unbounded">
          <h1 className="title">WELCOME TO THE GRID</h1>
          <div className="captionContainer flex">
            <h3 className="caption satoshi">
              A world where the code is breaking, and the Recruits are
              awakening.
            </h3>
          </div>
          <button className="exploreNow">
            <a href="#storySection">Explore now</a>
          </button>
          <div className="carouselContainer flex">
            <Carousel
              images={[
                { path: "./images/carouselImgs/1.svg", alt: "" },
                { path: "./images/carouselImgs/2.svg", alt: "" },
                { path: "./images/carouselImgs/3.svg", alt: "" },
                { path: "./images/carouselImgs/4.svg", alt: "" },
                { path: "./images/carouselImgs/5.svg", alt: "" },
              ]}
              speed={1}
            />
          </div>
        </div>
      </div>
      <img className="ellipse" src="./images/heroSection/ellipse.svg" alt="" />
    </div>
  );
}

export default HeroSection;
