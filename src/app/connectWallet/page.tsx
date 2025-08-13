'use client'
import React from "react";
import "./connectWalltet.scss";
import ConnectWallet from "../components/connect-wallet/connect-wallet";


export function ConnectYourWallet()
{
    return (
        <div className="connectWallet flex socialsFooterPadding">
            <div className="connectWalletContainer flex">
                <div className="sec1 flex">
                    <img src="/images/connectWallet/sectionImage.svg" alt="" />
                </div>
                <div className="sec2 flex">
                    <div className="sec2Container flex">

                    <h3 className="unbounded">Request Access</h3>
                    <ConnectWallet parentComponent={"connectWalletPage"} />
                    {/* <button className="satoshi">Connect your wallet</button> */}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ConnectYourWallet;