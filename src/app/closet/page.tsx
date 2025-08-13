"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import "./gallery.scss";
import NFTDetailsPopup, {
  NFTDetails,
} from "../components/NFTDetailsPopup/NFTDetailsPopup";
import { ethers } from "ethers";
import feeMediator from "../../abis/FeeMediator.json";
import { useAccount } from "wagmi";

// Magic Eden and Bridge contract addresses
const MAGIC_EDEN_ADDRESS = "0xFf0496b49d2d5D27f5a529347ea3071b0FF6ba96";
const BRIDGE_ADDRESS = "0x088Be3300dCD8Fb21cfd4c488371E93bE7370AFb";

// Contract ABIs
const MAGIC_EDEN_ABI = [
  "function balanceOf(address owner) external view returns (uint256)",
  "function tokensOfOwner(address owner) external view returns (uint256[] memory)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function approve(address to, uint256 tokenId) external",
  "function setApprovalForAll(address operator, bool approved) external",
  "function getApproved(uint256 tokenId) external view returns (address)",
  "function isApprovedForAll(address owner, address operator) external view returns (bool)",
  "function tokenURI(uint256 tokenId) external view returns (string)",
  "function name() external view returns (string)",
  "function symbol() external view returns (string)",
  "function totalSupply() external view returns (uint256)"
];

const BRIDGE_ABI = [
  "function burnNFT(uint256 tokenId) external returns (uint256)",
  "function tokenBurned(uint256 tokenId) external view returns (bool)"
];

interface NFTItem {
  tokenId: number;
  tokenURI: string;
  isPaused: boolean;
  metadata?: any;
  collection: 'recruits' | 'magiceden';
  isTransferred?: boolean;
}

export default function GalleryPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [nfts, setNfts] = useState<NFTItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState("All");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState<NFTDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTransferring, setIsTransferring] = useState<number[]>([]);
  const sortRef = useRef<HTMLDivElement>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [pendingTokens, setPendingTokens] = useState<
    { tokenIds: number[]; expectedStatus: boolean }[]
  >([]);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(
    null
  );

  const API_BASE_URL = process.env.NEXT_PUBLIC_APIURL || 'http://localhost:3001';

  const [fees, setFees] = useState({
    uriUpdateFee: "0.001",
    transferPauseFee: "0.0005",
  });

  // Check authentication on mount
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ISMINT !== "true") {
      router.push("/");
      return
    }
    const checkAuthentication = () => {
      const loginData = localStorage.getItem("loginData");
      
      if (!loginData) {
        router.push("/connectWallet");
        return;
      }
      
      setIsAuthenticating(false);
    };

    checkAuthentication();
  }, [router]);

  // Select all NFTs (both collections)
  const allSelected = selectedItems.length === nfts.length;

  const getSelectionKey = (collection: string, tokenId: number) => `${collection}-${tokenId}`;

  // Filter items based on sort option
  const filteredItems = nfts.filter((item) => {
    if (sortOption === "All") return true;
    if (sortOption === "Staked") return item.collection === 'recruits' && item.isPaused;
    if (sortOption === "Unstaked") return item.collection === 'recruits' && !item.isPaused;
    if (sortOption === "Recruits Pass") return item.collection === 'magiceden';
    if (sortOption === "Recruits") return item.collection === 'recruits';
    return true;
  });

  // Fetch Magic Eden NFTs with enhanced debugging
  const fetchMagicEdenNFTs = async (): Promise<NFTItem[]> => {
    if (!address || !isConnected) {
      console.log("🔍 Magic Eden fetch skipped: No address or not connected");
      return [];
    }
  
    try {
      console.log("🔍 Fetching Magic Eden NFTs for address:", address);
      console.log("📍 Magic Eden Contract:", MAGIC_EDEN_ADDRESS);
  
      // @ts-ignore
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Check if contract exists
      const code = await provider.getCode(MAGIC_EDEN_ADDRESS);
      if (code === '0x') {
        console.error("❌ No contract found at Magic Eden address");
        return [];
      }
  
      console.log("✅ Contract exists");
  
      const magicEdenContract = new ethers.Contract(MAGIC_EDEN_ADDRESS, MAGIC_EDEN_ABI, provider);
      const bridgeContract = new ethers.Contract(BRIDGE_ADDRESS, BRIDGE_ABI, provider);
  
      // Get contract info
      try {
        const [name, symbol, totalSupply] = await Promise.all([
          magicEdenContract.name(),
          magicEdenContract.symbol(),
          magicEdenContract.totalSupply()
        ]);
        console.log(`📋 Contract: ${name} (${symbol}) - Total Supply: ${totalSupply.toString()}`);
      } catch (error: any) {
        console.warn("⚠️ Could not get contract info:", error.message);
      }
  
      // Check balance first
      const balance = await magicEdenContract.balanceOf(address);
      console.log("💰 Expected Balance:", balance.toString());
  
      if (balance.toString() === '0') {
        console.log("📝 Balance is 0 - no NFTs owned");
        return [];
      }
  
      // Method 1: Try tokensOfOwner (most reliable)
      try {
        console.log("🔄 Method 1: Trying tokensOfOwner...");
        const tokenIds = await magicEdenContract.tokensOfOwner(address);
        console.log("✅ tokensOfOwner success! Token IDs:", tokenIds.map((id: bigint) => id.toString()));
        
        if (tokenIds.length > 0) {
          console.log(`🎯 Found ${tokenIds.length} tokens via tokensOfOwner`);
          return await processTokenIds(tokenIds, provider);
        }
      } catch (error: any) {
        console.log("❌ tokensOfOwner failed:", error.message);
      }
  
      // Method 2: Try tokenOfOwnerByIndex (ERC721Enumerable style)
      try {
        console.log("🔄 Method 2: Trying tokenOfOwnerByIndex...");
        const tokenIds: bigint[] = [];
        
        for (let i = 0; i < Number(balance); i++) {
          try {
            const tokenId = await magicEdenContract.tokenOfOwnerByIndex(address, i);
            tokenIds.push(tokenId);
            console.log(`📋 Index ${i}: Token ${tokenId.toString()}`);
          } catch (error: any) {
            console.error(`❌ Failed to get token at index ${i}:`, error.message);
            break; // Stop if we hit an error
          }
        }
  
        if (tokenIds.length > 0) {
          console.log(`🎯 Found ${tokenIds.length} tokens via tokenOfOwnerByIndex`);
          return await processTokenIds(tokenIds, provider);
        }
      } catch (error: any) {
        console.log("❌ tokenOfOwnerByIndex failed:", error.message);
      }
  
      // Method 3: Manual enumeration with wider range and starting from 0
      try {
        console.log("🔄 Method 3: Manual enumeration...");
        const totalSupply = await magicEdenContract.totalSupply();
        console.log("📊 Total Supply:", totalSupply.toString());
  
        const ownedTokens: bigint[] = [];
        
        // Increase search range and start from 0
        const maxToCheck = Math.min(Number(totalSupply), 2000); // Check more tokens
        console.log(`🔄 Checking tokens 0 to ${maxToCheck - 1}...`);
  
        // Use smaller batches and check sequentially to avoid missing tokens
        const batchSize = 10; // Smaller batches
        
        for (let start = 0; start < maxToCheck; start += batchSize) {
          const end = Math.min(start + batchSize - 1, maxToCheck - 1);
          console.log(`🔄 Batch: tokens ${start}-${end}`);
  
          // Process batch sequentially to avoid rate limiting
          for (let tokenId = start; tokenId <= end; tokenId++) {
            try {
              const owner = await magicEdenContract.ownerOf(tokenId);
              if (owner.toLowerCase() === address.toLowerCase()) {
                ownedTokens.push(BigInt(tokenId));
                console.log(`✅ Found owned token: ${tokenId}`);
              }
            } catch (error) {
              // Token doesn't exist or other error - continue
            }
          }
  
          // Check if we found all expected tokens
          if (ownedTokens.length >= Number(balance)) {
            console.log(`✅ Found all ${balance.toString()} expected tokens`);
            break;
          }
  
          // Progress update
          if (start % 100 === 0) {
            console.log(`📊 Progress: ${start}/${maxToCheck}, Found: ${ownedTokens.length}/${balance.toString()}`);
          }
  
          // Delay between batches
          await new Promise(resolve => setTimeout(resolve, 200));
        }
  
        console.log(`🎯 Manual enumeration result: ${ownedTokens.length}/${balance.toString()} tokens found`);
  
        if (ownedTokens.length > 0) {
          return await processTokenIds(ownedTokens, provider);
        }
  
      } catch (error: any) {
        console.log("❌ Manual enumeration failed:", error.message);
      }
  
      console.log("❌ All methods failed to find tokens");
      return [];
  
    } catch (error) {
      console.error("❌ Error fetching Magic Eden NFTs:", error);
      return [];
    }
  };

  // Helper function to process token IDs and get metadata
  const processTokenIds = async (tokenIds: bigint[], provider: any): Promise<NFTItem[]> => {
    console.log(`🔄 Processing ${tokenIds.length} token IDs...`);
  
    const bridgeContract = new ethers.Contract(BRIDGE_ADDRESS, BRIDGE_ABI, provider);
    const magicEdenContract = new ethers.Contract(MAGIC_EDEN_ADDRESS, [
      "function tokenURI(uint256 tokenId) external view returns (string memory)"
    ], provider);
  
    const validNFTs: NFTItem[] = [];
  
    // Process tokens one by one to avoid rate limiting and get better error info
    for (const tokenId of tokenIds) {
      try {
        console.log(`🔄 Processing token ${tokenId.toString()}...`);
        
        // Check if token is burned first
        let isTransferred = false;
        try {
          isTransferred = await bridgeContract.tokenBurned(tokenId);
          console.log(`📋 Token ${tokenId.toString()}: Burned=${isTransferred}`);
        } catch (error) {
          console.warn(`⚠️ Could not check burn status for ${tokenId.toString()}, assuming not burned`);
          isTransferred = false;
        }
  
        // Skip if already transferred
        if (isTransferred) {
          console.log(`⏭️ Token ${tokenId.toString()} already transferred, skipping`);
          continue;
        }
  
        // Get token URI
        let tokenURI = '';
        try {
          tokenURI = await magicEdenContract.tokenURI(tokenId);
          console.log(`📋 Token ${tokenId.toString()}: URI=${tokenURI ? 'Found' : 'Empty'}`);
        } catch (error: any) {
          console.warn(`⚠️ Failed to get tokenURI for ${tokenId.toString()}:`, error.message);
        }
  
        // Add to valid NFTs
        const nftItem: NFTItem = {
          tokenId: Number(tokenId),
          tokenURI,
          isPaused: false,
          collection: 'magiceden' as const,
          isTransferred
        };
  
        validNFTs.push(nftItem);
        console.log(`✅ Added token ${tokenId.toString()} to collection`);
  
      } catch (error) {
        console.error(`❌ Failed to process token ${tokenId.toString()}:`, error);
      }
  
      // Small delay between tokens
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`✅ Final result: ${validNFTs.length}/${tokenIds.length} tokens processed successfully`);
    return validNFTs;
  };

  // Fetch Recruits NFTs (existing logic)
  const fetchRecruitsNFTs = async (): Promise<NFTItem[]> => {
    if (!address) return [];

    try {
      console.log("🔍 Fetching Recruits NFTs...");
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/users/nfts?publicKey=${address}`, {
        method: 'GET',
        headers: {
          "Authorization": `Bearer ${token}`
        },
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();

      if (data && Array.isArray(data.nfts)) {
        console.log(`✅ Recruits NFTs fetched: ${data.nfts.length}`);
        return data.nfts.map((nft: any) => ({
          ...nft,
          collection: 'recruits' as const
        }));
      }
      
      return [];
    } catch (error) {
      console.error("❌ Error fetching Recruits NFTs:", error);
      return [];
    }
  };

  // Enhanced metadata fetching for both collections
  const fetchAllNFTMetadata = async () => {
    setIsLoading(true);
    
    if (!address) {
      setIsLoading(false);
      return;
    }

    try {
      console.log("🔄 Starting to fetch all NFT metadata...");
      
      // Fetch both collections in parallel
      const [magicEdenNFTs, recruitsNFTs] = await Promise.all([
        fetchMagicEdenNFTs(),
        fetchRecruitsNFTs()
      ]);

      console.log(`📊 Fetched: ${magicEdenNFTs.length} Magic Eden, ${recruitsNFTs.length} Recruits`);

      // Enrich Magic Eden NFTs with metadata
      const enrichedMagicEden = await Promise.all(
        magicEdenNFTs.map(async (nft) => {
          try {
            if (nft.tokenURI) {
              const res = await fetch(nft.tokenURI);
              const metadata = await res.json();
              if (metadata.image && metadata.image.startsWith("ipfs://")) {
                const ipfsUrl = metadata.image;
                const cid = ipfsUrl.substring(7).split("/")[0];
                const path = ipfsUrl.substring(7 + cid.length);
                metadata.image = `https://ipfs.io/ipfs/${cid}${path}`;
              }
              return { ...nft, metadata };
            }
            return nft;
          } catch (err) {
            console.error(`Failed to fetch Magic Eden metadata for tokenId ${nft.tokenId}`, err);
            return nft;
          }
        })
      );

      // Enrich Recruits NFTs with metadata (existing logic)
      const enrichedRecruits = await Promise.all(
        recruitsNFTs.map(async (nft: any) => {
          try {
            if (nft.tokenURI) {
              const res = await fetch(nft.tokenURI);
              const metadata = await res.json();
              if (metadata.image && metadata.image.startsWith("ipfs://")) {
                const ipfsUrl = metadata.image;
                const cid = ipfsUrl.substring(7).split("/")[0];
                const path = ipfsUrl.substring(7 + cid.length);
                metadata.image = `https://ipfs.io/ipfs/${cid}${path}`;
              }
              return { ...nft, metadata };
            }
            return nft;
          } catch (err) {
            console.error(`Failed to fetch Recruits metadata for tokenId ${nft.tokenId}`, err);
            return nft;
          }
        })
      );

      // Combine collections: Magic Eden first, then Recruits
      const allNFTs = [...enrichedMagicEden, ...enrichedRecruits];
      console.log(`🎯 Final NFT count: ${allNFTs.length} (${enrichedMagicEden.length} Magic Eden + ${enrichedRecruits.length} Recruits)`);
      setNfts(allNFTs);

      // Check pending tokens logic (existing)
      if (pendingTokens.length > 0) {
        const allProcessed = pendingTokens.every(pending => {
          const matchingTokens = pending.tokenIds.map(id => 
            allNFTs.find(nft => nft.tokenId === id && nft.collection === 'recruits')
          );
          return matchingTokens.every(token => token && token.isPaused === pending.expectedStatus);
        });
        
        if (allProcessed) {
            setPendingTokens([]);
            setPendingTokens([]);
            
            // Clear the refresh interval if it exists
          setPendingTokens([]);
            
            // Clear the refresh interval if it exists
          if (refreshInterval) {
            clearInterval(refreshInterval);
            setRefreshInterval(null);
          }
        }
      }

    } catch (err) {
      console.error("❌ Failed to fetch NFT data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Magic Eden NFT transfer (burn) - Individual only
  const handleTransfer = async (tokenId: number) => {
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      setIsTransferring(prev => [...prev, tokenId]);

      // @ts-ignore
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const magicEdenContract = new ethers.Contract(MAGIC_EDEN_ADDRESS, MAGIC_EDEN_ABI, signer);
      const bridgeContract = new ethers.Contract(BRIDGE_ADDRESS, BRIDGE_ABI, signer);

      // Check if approval is needed
      const [approved, isApprovedForAll] = await Promise.all([
        magicEdenContract.getApproved(tokenId),
        magicEdenContract.isApprovedForAll(address, BRIDGE_ADDRESS)
      ]);

      // ✅ Fixed string comparison - convert both to lowercase
      const needsApproval = !isApprovedForAll && approved.toLowerCase() !== BRIDGE_ADDRESS.toLowerCase();

      if (needsApproval) {
        // Show approval popup/confirmation
        const confirmApproval = window.confirm(
          `You need to approve the bridge contract to transfer your NFT #${tokenId}. This will require a separate transaction. Proceed?`
        );

        if (!confirmApproval) {
          setIsTransferring(prev => prev.filter(id => id !== tokenId));
          return;
        }

        // Request approval
        console.log("Requesting approval for token", tokenId);
        const approvalTx = await magicEdenContract.approve(BRIDGE_ADDRESS, tokenId);
        
        // Show loading state for approval
        alert("Approval transaction sent. Please wait for confirmation before proceeding with transfer.");
        await approvalTx.wait();
        alert("Approval confirmed! Now proceeding with transfer...");
      }

      // Execute burn transaction
      console.log("Burning token", tokenId);
      const burnTx = await bridgeContract.burnNFT(tokenId);
      
      // Show burn transaction status
      alert("Transfer transaction sent. Please wait for confirmation...");
      const receipt = await burnTx.wait();
      
      console.log("Burn successful:", receipt);
      alert(`NFT #${tokenId} transferred successfully!`);

      // Refresh the page to update NFT list
      window.location.reload();

    } catch (error: any) {
      console.error("Transfer failed:", error);
      
      if (error.code === 4001) {
        alert("Transfer cancelled by user");
      } else if (error.message?.includes("NotTokenOwnerOrApproved")) {
        alert("You don't own this NFT or it's not approved for transfer");
      } else if (error.message?.includes("TokenAlreadyBurned")) {
        alert("This NFT has already been transferred");
      } else {
        alert(`Transfer failed: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setIsTransferring(prev => prev.filter(id => id !== tokenId));
    }
  };

  // Existing stake/unstake functions for Recruits NFTs (unchanged)
  const handleStake = async (tokenIds: number[], isPaused: boolean) => {
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      setIsLoading(true);
      // @ts-ignore
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const mediatorContract = new ethers.Contract(
        feeMediator.address || "",
        feeMediator.abi,
        signer
      );

      const chainId = 11155111; // Sepolia testnet

      // ✅ Use provider.getNetwork() for ethers v6
      const network = await provider.getNetwork();
      if (Number(network.chainId) !== chainId) {
        try {
          // @ts-ignore
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: ethers.toBeHex(chainId) }],
          });
        } catch (error) {
          console.error("Failed to switch network:", error);
          setIsLoading(false);
          return;
        }
      }

      const totalFee = ethers.parseEther(
        (parseFloat(fees.transferPauseFee) * tokenIds.length).toString()
      );

      const tx = await mediatorContract.requestTransferPauseUpdate(
        tokenIds,
        !isPaused,
        { value: totalFee }
      );

      await tx.wait();

      setSelectedItems(prev => 
        prev.filter(key => !tokenIds.some(tokenId => key === `recruits-${tokenId}`))
      );

      setPendingTokens(prev => [
        ...prev,
        { tokenIds, expectedStatus: !isPaused },
      ]);
      
      fetchAllNFTMetadata();

    } catch (err: any) {
      console.error("Error requesting transfer pause update:", err);
      alert(
        `Failed to ${isPaused ? "unstake" : "stake"}: ${err.message || err}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleStakeSelected = async () => {
    if (selectedItems.length === 0) return;
    
    // Extract token IDs from selection keys for Recruits NFTs
    const recruitsTokenIds = selectedItems
      .filter(key => key.startsWith('recruits-'))
      .map(key => parseInt(key.split('-')[1]))
      .filter(tokenId => {
        const nft = nfts.find(n => n.tokenId === tokenId && n.collection === 'recruits');
        return nft && !nft.isPaused; // Only unstaked items
      });
    
    if (recruitsTokenIds.length > 0) {
      await handleStake(recruitsTokenIds, false);
    }
  };
  
  const handleUnstakeSelected = async () => {
    if (selectedItems.length === 0) return;
    
    // Extract token IDs from selection keys for Recruits NFTs
    const recruitsTokenIds = selectedItems
      .filter(key => key.startsWith('recruits-'))
      .map(key => parseInt(key.split('-')[1]))
      .filter(tokenId => {
        const nft = nfts.find(n => n.tokenId === tokenId && n.collection === 'recruits');
        return nft && nft.isPaused; // Only staked items
      });
    
    if (recruitsTokenIds.length > 0) {
      await handleStake(recruitsTokenIds, true);
    }
  };

  // Individual selection functions (unchanged)
  const handleSelectAll = () => {
    const recruitsNFTs = nfts.filter(nft => nft.collection === 'recruits');
    const recruitsSelectionKeys = recruitsNFTs.map(nft => getSelectionKey(nft.collection, nft.tokenId));
    
    const allRecruitsSelected = recruitsSelectionKeys.length > 0 && 
      recruitsSelectionKeys.every(key => selectedItems.includes(key)) &&
      selectedItems.length === recruitsSelectionKeys.length;
    
    if (allRecruitsSelected) {
      setSelectedItems([]);
    } else {
      setSelectedItems(recruitsSelectionKeys);
    }
  };

  const handleItemSelect = (id: number) => {
    console.log("🔍 Plus icon clicked for tokenId:", id);
    
    // 🔧 FIX: Find NFT by BOTH tokenId AND collection
    const nft = nfts.find(n => n.tokenId === id && n.collection === 'recruits');
    console.log("🔍 Found NFT:", nft);
    
    if (!nft) {
      console.log("❌ Selection blocked - Recruits NFT not found");
      return;
    }
  
    // No need to check collection since we already filtered for 'recruits'
    const selectionKey = getSelectionKey(nft.collection, id);
    console.log("🔍 Selection key generated:", selectionKey);
    console.log("🔍 Current selectedItems before:", selectedItems);
    
    if (selectedItems.includes(selectionKey)) {
      console.log("🔄 Deselecting item");
      setSelectedItems(selectedItems.filter(item => item !== selectionKey));
    } else {
      console.log("🔄 Selecting item");
      setSelectedItems([...selectedItems, selectionKey]);
    }
  };

  const openNFTDetails = (nft: NFTItem) => {
    // Only open details for Recruits NFTs
    if (nft.collection !== 'recruits') return;

    const nftDetails: NFTDetails = {
      id: nft.tokenId,
      imageUrl: nft.metadata?.image || "/images/gallery/character.svg",
      name: nft.metadata?.name || `Token #${nft.tokenId}`,
      attributes: nft.metadata?.attributes?.map((attr: any) => ({
        trait_type: attr.trait_type,
        value: attr.value,
        rarity: ""
      })) || []
    };

    setSelectedNFT(nftDetails);
  };

  const closeNFTDetails = () => {
    setSelectedNFT(null);
  };

  // Effect for periodic refresh
  useEffect(() => {
    if (pendingTokens.length > 0 && !refreshInterval) {
      const interval = setInterval(fetchAllNFTMetadata, 3000);
      setRefreshInterval(interval);
    } else if (pendingTokens.length === 0 && refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }
    
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [pendingTokens, refreshInterval]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setShowSortDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch NFT data on mount
  useEffect(() => {
    console.log("🔍 NFT Fetch Effect Triggered");
    console.log("Address:", address);
    console.log("IsConnected:", isConnected);
    console.log("IsAuthenticating:", isAuthenticating);
  
    // Only fetch when we have address, are connected, and not authenticating
    if (address && isConnected && !isAuthenticating) {
      console.log("✅ All conditions met - fetching NFTs");
      fetchAllNFTMetadata();
    } else {
      console.log("⏳ Waiting for wallet connection...");
      console.log("- Address exists:", !!address);
      console.log("- Is connected:", isConnected);
      console.log("- Not authenticating:", !isAuthenticating);
    }
  }, [address, isConnected, isAuthenticating]); // Add all dependencies
  
  // Add a separate effect to trigger when connection state changes
  useEffect(() => {
    if (address && isConnected) {
      console.log("🔗 Wallet connection detected, scheduling NFT fetch...");
      // Small delay to ensure connection is fully established
      const timer = setTimeout(() => {
        fetchAllNFTMetadata();
      }, 2000);
  
      return () => clearTimeout(timer);
    }
  }, [address, isConnected]);

  // Show loading screen during authentication check
  if (isAuthenticating) {
    return (
      <div className="background socialsFooterPadding">
        <div className="contentWrapper">
          <div className="loadingMessage">Checking authentication...</div>
        </div>
      </div>
    );
  }

  // Count selected Recruits items for showing stake/unstake buttons
  const selectedRecruitsCount = selectedItems.filter(key => key.startsWith('recruits-')).length;

  const recruitsNFTs = nfts.filter(nft => nft.collection === 'recruits');
  const recruitsSelectionKeys = recruitsNFTs.map(nft => getSelectionKey(nft.collection, nft.tokenId));
  const allRecruitsSelected = recruitsSelectionKeys.length > 0 && 
    recruitsSelectionKeys.every(key => selectedItems.includes(key)) &&
    selectedItems.length === recruitsSelectionKeys.length;

  return (
    <div className="background socialsFooterPadding">
      <div className="contentWrapper">
        {/* GALLERY Title */}
        <h1 className="galleryTitle unbounded">GALLERY</h1>

        {/* Controls */}
        <div className="topControls">
          <div className="leftControls flex">
            <label className="checkboxLabel unbounded">
              <input
                type="checkbox"
                checked={allRecruitsSelected}
                onChange={handleSelectAll}
                className="checkbox"
                disabled={isLoading}
              />
              <span>All</span>
            </label>
            
            {/* Only show Recruits stake/unstake buttons when Recruits NFTs are selected */}
            {selectedRecruitsCount > 0 && (
              <>
                <button 
                  className="stakeAllBtn satoshi"
                  onClick={handleStakeSelected}
                  disabled={isLoading}
                >
                  Stake Selected ({selectedRecruitsCount})
                </button>
                <button 
                  className="unstakeAllBtn satoshi"
                  onClick={handleUnstakeSelected}
                  disabled={isLoading}
                >
                  Unstake Selected ({selectedRecruitsCount})
                </button>
              </>
            )}
          </div>
          
          <div className="dropDown-section">
            <div className="sortControls" ref={sortRef}>
              <span>Filter by:</span>
              <div 
                className="sortDropdown"
                onClick={() => setShowSortDropdown(!showSortDropdown)}
              >
                <span>{sortOption}</span>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 8L10 12L14 8" stroke="white" strokeWidth="1.5" />
                </svg>
              </div>
              
              {/* Updated Dropdown Menu */}
              {showSortDropdown && (
                <div className="dropdownMenu satoshi">
                  {["All", "Recruits Pass", "Recruits", "Staked", "Unstaked"].map((option) => (
                    <h5 
                      key={option}
                      className="dropdownItem"
                      onClick={() => {
                        setSortOption(option);
                        setShowSortDropdown(false);
                      }}
                    >
                      {option}
                    </h5>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
          
        {/* Gallery Grid */}
        {!isLoading && filteredItems.length === 0 && (
          <div className="emptyMessage">
            {nfts.length === 0 
              ? "No NFTs found. Check your wallet connection." 
              : `No NFTs match the current filter: ${sortOption}`
            }
          </div>
        )}

        <div className="galleryGrid">
          {filteredItems.map((nft) => {
            const selectionKey = getSelectionKey(nft.collection, nft.tokenId);
            const isSelected = selectedItems.includes(selectionKey);
            const isStaked = nft.collection === 'recruits' && nft.isPaused;
            const isMagicEden = nft.collection === 'magiceden';
            const isTransferringThis = isTransferring.includes(nft.tokenId);
            
            return (
              <div
                key={`${nft.collection}-${nft.tokenId}`}
                className={
                  [
                    "cardWrapper",
                    isStaked ? "stakedCard" : "",
                    isSelected ? "selectedCard" : "",
                    isMagicEden ? "magicEdenCard" : ""
                  ].filter(Boolean).join(" ")
                }
              >
                <img
                  className="cardImage"
                  src={nft.metadata?.image || "/images/gallery/character.svg"}
                  alt=""
                  draggable={false}
                  onClick={() => openNFTDetails(nft)}
                  style={{ 
                    cursor: nft.collection === 'recruits' ? 'pointer' : 'default',
                    opacity: isTransferringThis ? 0.5 : 1
                  }}
                />

                {/* Collection badge */}
                {isMagicEden && (
                  <div className="collectionBadge" style={{ 
                    position: 'absolute', 
                    top: '8px', 
                    left: '8px', 
                    background: '#007bff', 
                    color: 'white', 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    fontSize: '12px' 
                  }}>
                    Recruits Pass
                  </div>
                )}

                {/* Staked badge (only for Recruits) */}
                {isStaked && (
                  <div className="stakedBadge">
                    <img src="/images/gallery/ri_hand-coin-line.svg" />
                  </div>
                )}

                {/* Plus icon for selection */}
                {!isSelected && !isMagicEden && (
                  <div
                    className="plusIcon"
                    onClick={() => handleItemSelect(nft.tokenId)}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 5V19M5 12H19"
                        stroke="black"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}

                {/* Checkmark icon for selected items */}
                {isSelected && !isTransferringThis && (
                  <div
                    className="checkIcon"
                    onClick={() => handleItemSelect(nft.tokenId)}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M5 12L10 17L19 8"
                        stroke="#10151E"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}

                {/* Magic Eden Transfer Button (Individual Only) */}
                {isMagicEden && (
                  <button
                    onClick={() => handleTransfer(nft.tokenId)}
                    className="transferBtn unboundedLight"
                    disabled={isTransferringThis}
                    style={{
                      position: 'absolute',
                      bottom: '8px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '4px',
                      cursor: isTransferringThis ? 'not-allowed' : 'pointer',
                      opacity: isTransferringThis ? 0.6 : 1
                    }}
                  >
                    {isTransferringThis ? 'TRANSFERRING...' : 'TRANSFER'}
                  </button>
                )}

                {/* Recruits Stake/Unstake Buttons (unchanged) */}
                {nft.collection === 'recruits' && (
                  <>
                    {/* Unstake button for staked items */}
                    {isStaked && (
                      <button
                        onClick={() => handleStake([nft.tokenId], isStaked)}
                        className="unstakeBtn unboundedLight"
                        disabled={isLoading}
                      >
                        UNSTAKE
                      </button>
                    )}

                    {/* Stake button for unstaked items */}
                    {!isStaked && (
                      <button
                        onClick={() => handleStake([nft.tokenId], isStaked)}
                        className={[
                          "stakeBtn unboundedLight",
                          isSelected ? "selectedStakeBtn" : ""
                        ].filter(Boolean).join(" ")}
                        disabled={isLoading}
                      >
                        STAKE
                      </button>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* NFT Details Popup (only for Recruits) */}
        <NFTDetailsPopup nft={selectedNFT} onClose={closeNFTDetails} />
      </div>
    </div>
  );
}
