import React from "react";
import "./footer.scss";
import Link from "next/link";
interface navItem {
  link: string;
  name: string;
}

export function Footer() {
  const navItems: navItem[] = [
    {
      link: "/termsAndConditions",
      name: "Terms & Conditions",
    },
    {
      link: "/about",
      name: "About",
    },
    {
      link: "/",
      name: "Home",
    }
  ];
  return (
    <div className="footer">
      <div className="navItems flex">
        {navItems.map((navItem) => (
          <Link
            rel="stylesheet"
            key={navItem.name}
            className="navItem satoshi"
            href={navItem.link}
          >
            {navItem.name}
          </Link>
        ))}
      </div>
      <div className="copyrightByline unbounded">
        ⓒ Recruits, LLC. All rights reserved.
      </div>
    </div>
  );
}

export default Footer;
