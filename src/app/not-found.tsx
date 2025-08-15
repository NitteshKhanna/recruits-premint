import React from "react";
import "./not-found.scss";
import Link from "next/link";

export function notFound() {
  return (
    <div className="notFound flex">
      <div className="notFoundContainer flex">
        <img src="/images/notFound/mobileBG.svg" className="notFoundImg" alt="" />
        <h1 className="title unbounded">LOST IN THE GRID?</h1>
        <button>
          <a href="/">Return home</a>
        </button>
      </div>
    </div>
  );
}

export default notFound;
