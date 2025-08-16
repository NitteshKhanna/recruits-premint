"use client";
import React, { useEffect, useState } from "react";
import ConnectWallet from "../connect-wallet/connect-wallet";
import "./header.scss";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User } from "@/app/models/User";
import { LoginData } from "@/app/models/loginData";

export function Header() {
  const apiurl = process.env.NEXT_PUBLIC_APIURL;
  let response;
  const [user, setUser] = useState<User | null>(null);
  const [menuClicked, setMenuClicked] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  let inGameCurrency: number = 0;
  let loginData: LoginData;
  const router = useRouter();

  const redirectToNftsPage = () => {
    router.push("/components/grid");
  };

  const getFilteredPages = () => {
    const allPages =
      process.env.NEXT_PUBLIC_ISMINT === "true"
        ? [
            {
              name: "Home",
              link: "/",
            },
            {
              name: "Closet",
              link: "/closet",
            },
            {
              name: "About",
              link: "/about",
            },
            {
              name: "Admin",
              link: "/admin",
            },
          ]
        : [
            {
              name: "Home",
              link: "/",
            },
            {
              name: "About",
              link: "/about",
            },
            {
              name: "Admin",
              link: "/admin",
            },
          ];

    // Filter out Admin if user is not admin
    return allPages.filter((page) => page.name !== "Admin" || isAdmin);
  };

  async function fetchUserByPublicKey(publicKey: string, token: string) {
    try {
      const response = await fetch(
        `${apiurl}/users/user/?publicKey=${publicKey}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        // Check if user access is ADMIN
        setIsAdmin(userData.access === "ADMIN");
      } else {
        console.error("Failed to fetch user data");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }

  async function refreshIngameCurrency() {
    response = await fetch(`${apiurl}/users/money/?${user?.publicKey}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${loginData.token}`,
      },
    });
  }

  const handleMenuItemClick = () => {
    setMenuClicked(false);
  };

  useEffect(() => {
    const loginDataStr = localStorage.getItem("loginData");
    setMenuClicked(false);
    if (loginDataStr) {
      loginData = JSON.parse(loginDataStr);
      setUser(loginData.user);

      // Fetch user data from backend using publicKey
      if (loginData.user.publicKey && loginData.token) {
        fetchUserByPublicKey(loginData.user.publicKey, loginData.token);
      }
    }
    if (user?.inGameCurrency) {
      inGameCurrency = user.inGameCurrency;
    } else {
      inGameCurrency = -1;
    }
  }, []);

  const pages = getFilteredPages();

  return (
    <div className="header flex">
      <img className="leftWing" src="./images/header/left wing.svg" alt="" />
      <div className="navBar flex">
        <h3 className="title1 unbounded">
          <a rel="stylesheet" className="logoTxt" href="/">
            <img src="./images/logoWhite.svg" alt="Logo" />
          </a>
        </h3>
        <img
          className="menuIcon"
          src="./images/header/menu.svg"
          alt=""
          onClick={() => setMenuClicked(true)}
        />
        <div className="navItems flex">
          {pages.map((page, index) => (
            <h4 className="navItem title2 satoshi" key={index}>
              <a rel="stylesheet" href={page.link}>
                {page.name}
              </a>
            </h4>
          ))}
        </div>
        <div className="connectWalletBtnContainer">
          {/* <ConnectWallet parentComponent="navbar" /> */}
        </div>
      </div>
      <img className="rightWing" src="./images/header/right wing.svg" alt="" />
      <div className={`mobileMenu ${menuClicked ? "clicked" : ""}`}>
        <div className="topSection flex">
          <h3 className="title1 unbounded">
            <a rel="stylesheet" className="logoTxt" href="/">
              Recruits
            </a>
          </h3>
          <img
            className="closeIcon"
            src="./images/header/close.svg"
            alt=""
            onClick={() => setMenuClicked(false)}
          />
        </div>
        <div className="menuBar flex">
          {pages.map((page, index) => (
            <a
              className="menuItem satoshi"
              href={page.link}
              title={page.name}
              key={index}
              onClick={handleMenuItemClick}
            >
              {page.name}
            </a>
          ))}
          {/* <ConnectWallet parentComponent="navbar" /> */}
        </div>
      </div>
    </div>
  );
}

export default Header;
