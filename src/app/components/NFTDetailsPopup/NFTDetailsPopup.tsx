// NFTDetailsPopup.tsx
import React from 'react';
import './NFTDetailsPopup.scss';
import "../../page.scss"

type NFTAttribute = {
  trait_type: string;
  value: string;
  rarity?: string;
};

export type NFTDetails = {
  id: number;
  imageUrl: string;
  name: string;
  attributes: NFTAttribute[];
};

interface NFTDetailsPopupProps {
  nft: NFTDetails | null;
  onClose: () => void;
}

const NFTDetailsPopup: React.FC<NFTDetailsPopupProps> = ({ nft, onClose }) => {
  if (!nft) return null;

  const handleDownload = async () => {
    try {
      const response = await fetch(nft.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${nft.name}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <div className="nftPopupOverlay" onClick={onClose}>
      <div className="nftPopupContent unbounded" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button className="closeButton" onClick={onClose}>
          X
        </button>
        
        <div className="nftPopupImageContainer">
          <img src={nft.imageUrl} alt={nft.name} className="nftPopupImage" />
        </div>
        
        <div className="nftPopupDetails">
          <h2 className="nftPopupTitle">{nft.name}</h2>
          
          <div className="nftPopupAttributes">
            {nft.attributes.map((attr, index) => (
              <div key={index} className="nftPopupAttribute">
                <div className="attributeLabel">{attr.trait_type}</div>
                <div className="attributeValue">{attr.value}</div>
                {attr.rarity && <div className="attributeRarity">{attr.rarity}</div>}
              </div>
            ))}
          </div>
          
          <button className="downloadButton" onClick={handleDownload}>
            Download High Res Image
          </button>
        </div>
      </div>
    </div>
  );
};

export default NFTDetailsPopup;