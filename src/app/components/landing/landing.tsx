import React from "react";
import HeroSection from "../heroSection/heroSection";
import StorySection from "../storySection/storySection";
import AnnouncementSection from "../announcementSection/announcementSection";
import ClosetSection from "../closetSection/closetSection";
import Socials from "../about/socials/socials";
import Footer from "../footer/footer";

export function Landing() {
  return (
    <div className="landing">
      <HeroSection />
      <StorySection />
      {process.env.NEXT_PUBLIC_ISMINT === "true" ?
      <AnnouncementSection />:<></>}
      <ClosetSection />
      <Socials />
    </div>
  );
}

export default Landing;
