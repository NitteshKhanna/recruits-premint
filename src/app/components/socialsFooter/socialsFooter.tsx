"use client";
import React, { useEffect, useState } from "react";
import "./socialsFooter.scss";
import Link from "next/link";
import socialsJSON from "../../data/socials.json";
import { usePathname } from "next/navigation";
import pagesJSON from "../../data/pages.json";

export function SocialsFooter() {
  let pathArr = usePathname().split("/");
  let pageName = pathArr[pathArr.length - 1].toLowerCase();
  let [isSocialsFooter, setIsSocialFooter] = useState(false);
  useEffect(() => {
    pagesJSON.forEach((page) => {
      
      if (page.name.toLowerCase() == pageName) {
        setIsSocialFooter(page.footerType != "Big");
      }
    });
  });
  return (
    <div className={`socialsFooter flex ${isSocialsFooter ? "" : "invisible"}`}>
      {socialsJSON.map((social, index) => (
        <a href={social.link} key={index}>
          <img src={social.imageUrlSmall} alt={social.name} />
        </a>
      ))}
    </div>
  );
}

export default SocialsFooter;
