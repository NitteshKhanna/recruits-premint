"use client";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import "./grid.scss";
import feeMediator from "../../../abis/FeeMediator.json";
import { ethers } from "ethers";

type NFT = {
  tokenId: number;
  tokenURI: string;
  isPaused: boolean;
  metadata?: {
    name: string;
    description: string;
    image: string;
    attributes: { trait_type: string; value: string }[];
  };
};

export function Page() {
  const { address, isConnected } = useAccount();
  const [nfts, setNfts] = useState<NFT[]>([]);
  let imgUrl: string;
  const [fees, setFees] = useState({
    uriUpdateFee: "0.001",
    transferPauseFee: "0.0005",
  });

  const handleStake = async (tokenId: number, isPaused: boolean) => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const mediatorContract = new ethers.Contract(
      feeMediator.address || "",
      feeMediator.abi,
      signer
    );

    try {
      const chainId = 11155111;

      if (window.ethereum.networkVersion !== chainId) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: ethers.toBeHex(chainId) }],
          });
        } catch {}
      }

      const address = await signer.getAddress();
      const balance = await provider.getBalance(address);

      const network = await provider.getNetwork();

      const tx = await mediatorContract.requestTransferPauseUpdate(
        tokenId,
        !isPaused,
        { value: ethers.parseEther(fees.transferPauseFee) }
      );

      await tx.wait();

      // setSuccess(`Request submitted. Token transfers will be ${!token.paused ? 'paused' : 'unpaused'} shortly.`);

      // Note: The actual token.paused state will update when the user refreshes
      // or when you implement a status check mechanism
    } catch (err) {
      console.error("Error requesting transfer pause update:", err);
      // setError(err.message || 'Failed to submit request');
    }
  };

  const fetchNFTMetadata = async () => {
    const data = localStorage.getItem("loginData");
    if (!data) return;

    try {
      const parsed = JSON.parse(data);
      const nftList = parsed.nfts;

      if (Array.isArray(nftList)) {
        const enrichedNFTs: NFT[] = await Promise.all(
          nftList.map(async (nft: NFT) => {
            try {
              const res = await fetch(nft.tokenURI);
              const metadata = await res.json();
              const ipfsUrl = metadata.image;
              const cid = ipfsUrl.substring(7).split("/")[0];
              const path = ipfsUrl.substring(7 + cid.length);
              const imgUrl = `https://ipfs.io/ipfs/${cid}${path}`;
              metadata.image = imgUrl; // Set the resolved image URL
              return { ...nft, metadata };
            } catch (err) {
              console.error(
                `Failed to fetch metadata for tokenId ${nft.tokenId}`,
                err
              );
              return { ...nft, metadata: undefined };
            }
          })
        );

        setNfts(enrichedNFTs);
      }
    } catch (err) {
      console.error("Failed to parse loginData:", err);
    }
  };


  useEffect(() => {
    const fetchFees = async () => {
      // const feeData = await getFees();
      // setFees(feeData);
      // have to get fees from backend
    };

    
    fetchNFTMetadata();
  }, []);

  return (
    
    <div className="gridContainer">
      <div className="head">
        <h2>Closet</h2>
        <button className="refresh-button" onClick={fetchNFTMetadata}>
          <img src="/refresh-svgrepo-com.svg" alt="Refresh Icon" />
        </button>
      </div>

      <div className="nft-grid">
      {nfts.map((nft: NFT, index: number) => (
        <div key={index} className="nftCard">
          <img
            className="cardImg"
            src={nft.metadata?.image}
            alt={`NFT ${nft.tokenId}`}
          />
          {/* <div className="sec1"> */}
          <span>
            <h3>#{nft.metadata?.name || `Token #${nft.metadata?.image}`}</h3>
            <p className="tokenId">Token Id : {nft.tokenId}</p>
            <p className="descrption">{nft.metadata?.description}</p>
            <h4>Attributes</h4>
            {nft.metadata?.attributes.map((attribute, i) => (
              <p className="attribute" key={i}>
                <b>{attribute.trait_type}</b> {attribute.value}
              </p>
            ))}
          </span>
          <div className="nftCardFooter">
            {nft.isPaused && <span className="statusTag.staked">#Staked</span>}
          </div>
          {/* </div> */}
          {/* <div className="sec2"> */}
          <button
            className="toggleButton"
            onClick={() => {
              handleStake(nft.tokenId, nft.isPaused);
            }}
          >
            {nft.isPaused ? "Unstake" : "Stake"}
          </button>
        </div>
        // </div>
      ))}
      </div>
    </div>
  );
}

export default Page;
