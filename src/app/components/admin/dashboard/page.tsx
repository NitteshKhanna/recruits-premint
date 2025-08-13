'use client';
import Image from "next/image";
import "./admin-dashboard.scss";
import { ChangeEvent, FormEvent, useState, useEffect } from "react";
import { Announcement } from "@/app/models/Announcement";
import { Fee } from "@/app/models/Fee";
import { ethers } from "ethers";
import feeMediator from "../../../../abis/FeeMediator.json";
import nftContract from "../../../../abis/TheRecruits.json";
import { ToastContainer, toast } from 'react-toastify';


export function AdminDashboard() {
  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState<any>(null);
  
  // Data states
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [stakingFeeLoading, setStakingFeeLoading] = useState(false);
  const [traitFeeLoading, setTraitFeeLoading] = useState(false);
  const [stakingRewardLoading, setStakingRewardLoading] = useState(false);
  const [royaltyLoading, setRoyaltyLoading] = useState(false);
  const [updateAnnouncementLoading, setUpdateAnnouncementLoading] = useState(false);
  const [deleteAnnouncementLoading, setDeleteAnnouncementLoading] = useState(false);

  // Fee-related states
  const [fees, setFees] = useState<Fee[]>([]);
  const [currentTransferPauseFee, setCurrentTransferPauseFee] = useState<string>("");
  const [currentURIUpdateFee, setCurrentURIUpdateFee] = useState<string>("");
  const [newTransferPauseFee, setNewTransferPauseFee] = useState<string>("");
  const [newURIUpdateFee, setNewURIUpdateFee] = useState<string>("");
  
  // Royalty
  const [royalty, setRoyalty] = useState('');
  const [currentRoyalty, setCurrentRoyalty] = useState('');
  
  // Staking Reward
  const [stakingReward, setStakingReward] = useState('');
  const [stakingRewardDefault, setStakingRewardDefault] = useState('');

  const [error, setError] = useState<string | null>(null);

  // API base URL - adjust this to match your backend URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_APIURL || 'http://localhost:3001';

  // Character limit constant
  const DESCRIPTION_CHAR_LIMIT = 500;

  // Fetch all announcements
  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/announcements`);
      if (!response.ok) {
        throw new Error('Failed to fetch announcements');
      }
      const data = await response.json();
      setAnnouncements(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast.error('Failed to load announcements')
      setError('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  // Load announcements on component mount
  useEffect(() => {
    fetchAnnouncements();
    fetchFees(); // Also fetch fees on component mount
    fetchStakingRewardFee();
    fetchCurrentRoyalty(); // Fetch current royalty on component mount
  }, []);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("authToken")

    
    if (!title.trim() || !description.trim()) {
      setError('Title and description are required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('heading', title.trim());
      formData.append('description', description.trim());
      
      if (image) {
        formData.append('image', image);
      }

      const response = await fetch(`${API_BASE_URL}/announcements`, {
        method: 'POST',
         headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create announcement');
      }

      const newAnnouncement = await response.json();
      
      // Reset form
      setTitle('');
      setDescription('');
      setImage(null);
      setPreviewUrl(null);
      
      // Refresh announcements list
      await fetchAnnouncements();
      
    } catch (error) {
      console.error('Error creating announcement:', error);
      toast.error('Failed to upload announcement');
      setError(error instanceof Error ? error.message : 'Failed to create announcement');
    } finally {
      setLoading(false);
    }
  };

  // Delete announcement
  const handleDeleteAnnouncement = async (announcementId: string) => {
    const token = localStorage.getItem("authToken")

    try {
      setDeleteAnnouncementLoading(true);
      const response = await fetch(`${API_BASE_URL}/announcements?id=${announcementId}`, {
        method: 'DELETE',
         headers: {
          "Authorization": `Bearer ${token}`
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete announcement');
      }

      // Refresh announcements list
      await fetchAnnouncements();
      
      // Close modal if open
      if (isModalOpen) {
        closeModal();
      }
      
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast.error('Failed to delete announcement');
      setError(error instanceof Error ? error.message : 'Failed to delete announcement');
    } finally {
      setDeleteAnnouncementLoading(false);
    }
  };

  // Check if a value has changed from its default
  const isChanged = (current: string, defaultValue: string) => {
    return current !== defaultValue;
  };

  const updateURIFeeInContract = async (newFeeInEther: string) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const mediatorContract = new ethers.Contract(
        feeMediator.address || "",
        feeMediator.abi,
        signer
      );

      // Convert ETH to wei for the contract
      const feeInWei = ethers.parseEther(newFeeInEther);
      
      const tx = await mediatorContract.setURIUpdateFee(feeInWei);
      await tx.wait();
      
      return true;
    } catch (err) {
      console.error("Error in setting URI update fee:", err);
      throw new Error("Setting URI update fee failed during contract interaction");
    }
  };

  const updateTransferPauseFeeInContract = async (newFeeInEther: string) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const mediatorContract = new ethers.Contract(
        feeMediator.address || "",
        feeMediator.abi,
        signer
      );

      // Convert ETH to wei for the contract
      const feeInWei = ethers.parseEther(newFeeInEther);
      
      const tx = await mediatorContract.setTransferPauseFee(feeInWei);
      await tx.wait();
      
      return true;
    } catch (err) {
      console.error("Error in setting transfer pause fee:", err);
      throw new Error("Setting transfer pause fee failed during contract interaction");
    }
  };

  // Fetch current royalty from NFT contract
  const fetchCurrentRoyalty = async () => {
    try {
      setRoyaltyLoading(true);
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const nftContractInstance = new ethers.Contract(
        nftContract.address,
        nftContract.abi,
        provider
      );
      
      // Use royaltyInfo function to get the current royalty settings
      // First param is a tokenId (using 1), second is a sale price (using 10000 for percentage calculation)
      const royaltyInfo = await nftContractInstance.royaltyInfo(1, 10000);
      
      // royaltyInfo returns [receiver, royaltyAmount]
      // We convert basis points to percentage (500 basis points = 5%)
      const royaltyBasisPoints = Number(royaltyInfo[1]);
      const royaltyPercentage = (royaltyBasisPoints / 100).toFixed(2);
      
      setCurrentRoyalty(royaltyPercentage);
      setRoyalty(royaltyPercentage);
      
    } catch (err) {
      console.error("Error fetching current royalty:", err);
      toast.error("Failed to load current royalty settings");
    } finally {
      setRoyaltyLoading(false);
    }
  };

  // Update royalty through FeeMediator
  const updateRoyalty = async () => {
    try {
      if (!royalty || isNaN(Number(royalty)) || Number(royalty) < 0 || Number(royalty) > 100) {
        toast.error("Please enter a valid royalty percentage between 0 and 100");
        return;
      }
      
      setRoyaltyLoading(true);
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const mediatorContract = new ethers.Contract(
        feeMediator.address || "",
        feeMediator.abi,
        signer
      );
      
      // Convert percentage to basis points (e.g., 5.5% = 550 basis points)
      const feeNumerator = Math.floor(parseFloat(royalty) * 100);
      
      // Call requestDefaultRoyaltyChange function
      const tx = await mediatorContract.requestDefaultRoyaltyChange(feeNumerator);
      
      await tx.wait();
      
      // Update the current royalty value
      setCurrentRoyalty(royalty);
      
      toast.success("Royalty update request successful");
      
      // Refresh royalty data after a short delay to ensure blockchain has updated
      setTimeout(() => {
        fetchCurrentRoyalty();
      }, 5000);
      
    } catch (err) {
      console.error("Error updating royalty:", err);
      toast.error("Failed to update royalty settings");
    } finally {
      setRoyaltyLoading(false);
    }
  };

  const fetchFees = async () => {
    try {
      setStakingFeeLoading(true);
      setTraitFeeLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const mediatorContract = new ethers.Contract(
        feeMediator.address || "",
        feeMediator.abi,
        provider
      );
      
      // Fetch current fees from blockchain
      const uriUpdateFee = await mediatorContract.uriUpdateFee();
      const transferPauseFee = await mediatorContract.transferPauseFee();
      
      // Convert from wei to ether for display
      const uriUpdateFeeEther = ethers.formatEther(uriUpdateFee);
      const transferPauseFeeEther = ethers.formatEther(transferPauseFee);
      
      // Set current fee values for display and comparison
      setCurrentURIUpdateFee(uriUpdateFeeEther);
      setCurrentTransferPauseFee(transferPauseFeeEther);
      
      // Initialize new fee inputs with current values if they're empty
      if (!newURIUpdateFee) setNewURIUpdateFee(uriUpdateFeeEther);
      if (!newTransferPauseFee) setNewTransferPauseFee(transferPauseFeeEther);
      
      setFees([
        {
          name: "URI Update Fee",
          value: uriUpdateFee.toString(),
          displayValue: uriUpdateFeeEther
        },
        {
          name: "Transfer Pause Fee",
          value: transferPauseFee.toString(),
          displayValue: transferPauseFeeEther
        }
      ]);
      
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "An unexpected error occurred loading fees.");
    } finally {
      setStakingFeeLoading(false);
      setTraitFeeLoading(false);    }
  };
    const fetchStakingRewardFee = async () => {
    try {
      setStakingRewardLoading(true);
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_BASE_URL}/configuration/get/?key=INGAME_CURRENCY_REWARD`, {
        method: 'GET',
        headers: {
          "Authorization": `Bearer ${token}`
        },
       
      });
      if (!res.ok) {
        throw new Error("Failed to fetch staking reward");
      }
      const data = await res.json();      
      setStakingReward(String(data.value));
      setStakingRewardDefault(String(data.value));
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "An unexpected error occurred loading staking reward.");
    } finally {
      setStakingRewardLoading(false);
    }
  };

  const updateStakingReward = async () => {
    try {
      if (!stakingReward || isNaN(Number(stakingReward)) || Number(stakingReward) < 0) {
        toast.error("Please enter a valid staking reward amount");
        return;
      }
      
      setStakingRewardLoading(true);
      
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/configuration`, {
        method: 'PUT',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          key: "INGAME_CURRENCY_REWARD",
          value: stakingReward
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update staking reward');
      }

      // Refresh the staking reward data
      await fetchStakingRewardFee();
      
      toast.success("Staking Reward updated successfully");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "An unexpected error occurred.");
    } finally {
      setStakingRewardLoading(false);
    }
  };

  const updateStakingPlatformFee = async () => {
    try {
      if (!newTransferPauseFee || isNaN(Number(newTransferPauseFee)) || Number(newTransferPauseFee) < 0) {
        toast.error("Please enter a valid fee amount");
        return;
      }
      
      setStakingFeeLoading(true);
      
      // Update the fee on the blockchain
      await updateTransferPauseFeeInContract(newTransferPauseFee);
      
      // Refresh the fee data
      await fetchFees();
      
      toast.success("Staking Platform Fee updated successfully");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "An unexpected error occurred.");
    } finally {
      setStakingFeeLoading(false);
    }
  };

  const updateTraitApplyPlatformFee = async () => {
    try {
      if (!newURIUpdateFee || isNaN(Number(newURIUpdateFee)) || Number(newURIUpdateFee) < 0) {
        toast.error("Please enter a valid fee amount");
        return;
      }
      
      setTraitFeeLoading(true);
      
      // Update the fee on the blockchain
      await updateURIFeeInContract(newURIUpdateFee);
      
      // Refresh the fee data
      await fetchFees();
      
      toast.success("Trait Apply Platform Fee updated successfully");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "An unexpected error occurred.");
    } finally {
      setTraitFeeLoading(false);
    }
  };

  const openUpdateModal = (announcement: any) => {
    setCurrentAnnouncement({
      ...announcement,
      title: announcement.heading // Map heading to title for consistency
    });
    setIsModalOpen(true);
    setImage(null);
    setPreviewUrl(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentAnnouncement(null);
    setPreviewUrl(null);
    setImage(null);
  };

  const handleUpdateAnnouncement = async () => {

    const token = localStorage.getItem("authToken")

    if (!currentAnnouncement || !currentAnnouncement.title?.trim() || !currentAnnouncement.description?.trim()) {
      setError('Title and description are required');
      return;
    }

    try {
      setUpdateAnnouncementLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('id', currentAnnouncement.id);
      formData.append('heading', currentAnnouncement.title.trim());
      formData.append('description', currentAnnouncement.description.trim());
      
      if (image) {
        formData.append('image', image);
      }

      const response = await fetch(`${API_BASE_URL}/announcements`, {
        method: 'PUT',
         headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update announcement');
      }

      const updatedAnnouncement = await response.json();
      
      // Refresh announcements list
      await fetchAnnouncements();
      
      closeModal();
      
    } catch (error) {
      console.error('Error updating announcement:', error);
      toast.error('Failed to update announcement');
      setError(error instanceof Error ? error.message : 'Failed to update announcement');
    } finally {
      setUpdateAnnouncementLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <div className="admin-dashboard">
      <ToastContainer/>
      <h1>Admin Panel</h1>
      <div className="admin-panel">
        <div className="post-announcement">
          <h3>
            Post an announcement
          </h3>
          <hr></hr>
          <div className="announcement-form">
            <form className="announcementForm" onSubmit={handleSubmit}>
        
              <label className="imageUpload">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange}
                  className={"fileInput"}
                  disabled={loading}
                />
                {previewUrl ? (
                  <div className={"previewContainer"}>
                    <Image 
                      src={previewUrl} 
                      alt="Preview" 
                      fill 
                      style={{ objectFit: 'cover' }} 
                    />
                  </div>
                ) : (
                  <div className={"addImagePlaceholder"}>
                    <span className={"plusIcon"}>+</span>
                    <span>Add Image</span>
                  </div>
                )}
              </label>
              
              <div className={"inputGroup"}>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Title"
                  className={"titleInput"}
                  disabled={loading}
                  required
                />
              </div>
              
              <div className={"inputGroup"}>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description"
                  className={"descriptionInput"}
                  rows={5}
                  disabled={loading}
                  required
                  maxLength={DESCRIPTION_CHAR_LIMIT}
                />
                <div className="character-count" style={{ textAlign: 'right', fontSize: '0.8rem', color: '#666', marginTop: '0.3rem' }}>
                  {DESCRIPTION_CHAR_LIMIT - description.length} characters left
                </div>
              </div>
              
              <button type="submit" className={"submitButton"} disabled={loading}>
                {loading ? 'Uploading...' : 'Upload announcement'}
              </button>
            </form>
          </div>
        </div>
        <div className="fees-section">
          <h3>
            Fees & Rewards
          </h3>
          <hr></hr>
          <div >
            {/* Staking Platform Fee (TransferPauseFee) */}
            <div className="section">
              <h2 className="section-title">Staking Platform Fee</h2>
              <div className="input-row">
                <label className="price-label">Price</label>
                <input
                  type="text"
                  value={newTransferPauseFee}
                  onChange={(e) => setNewTransferPauseFee(e.target.value)}
                  className="price-input"
                  disabled={stakingFeeLoading}
                />
              </div>
              <button 
                onClick={updateStakingPlatformFee}
                className={`update-button ${isChanged(newTransferPauseFee, currentTransferPauseFee) ? 'changed' : ''}`}
                disabled={loading || !newTransferPauseFee}
              >
                {stakingFeeLoading ? 'Updating...' : 'Update'}
              </button>
            </div>
            
            {/* Trait Apply Platform Fee (URIUpdateFee) */}
            <div className="section">
              <h2 className="section-title">Trait apply platform Fee</h2>
              <div className="input-row">
                <label className="price-label">Price</label>
                <input
                  type="text"
                  value={newURIUpdateFee}
                  onChange={(e) => setNewURIUpdateFee(e.target.value)}
                  className="price-input"
                  disabled={traitFeeLoading}
                />
              </div>
              <button 
                onClick={updateTraitApplyPlatformFee}
                className={`update-button ${isChanged(newURIUpdateFee, currentURIUpdateFee) ? 'changed' : ''}`}
                disabled={loading || !newURIUpdateFee}
              >
                {traitFeeLoading ? 'Updating...' : 'Update'}
              </button>
            </div>
            
            {/* Royalty */}
            <div className="section">
              <h2 className="section-title">Royalty</h2>
              <div className="input-row">
                <label className="price-label">Price  (%)</label>
                <input
                  type="text"
                  value={royalty}
                  onChange={(e) => setRoyalty(e.target.value)}
                  className="price-input"
                  disabled={royaltyLoading}
                  placeholder={royaltyLoading ? "Loading..." : "Enter royalty percentage"}
                />
              </div>
              <button 
                onClick={updateRoyalty}
                className={`update-button ${isChanged(royalty, currentRoyalty) ? 'changed' : ''}`}
                disabled={royaltyLoading || !royalty || royalty === currentRoyalty}
              >
                {royaltyLoading ? 'Updating...' : 'Update'}
              </button>
            </div>
            
            {/* Staking Reward */}
            <div className="section">
              <h5 className="section-title">Staking Reward</h5>
              <div className="input-row">
                <label className="price-label">Price</label>
                <input
                  type="text"
                  value={stakingReward}
                  onChange={(e) => setStakingReward(e.target.value)}
                  className="price-input"
                  disabled={stakingRewardLoading}
                />
              </div>
              <button 
                onClick={updateStakingReward}
                className={`update-button ${isChanged(stakingReward, stakingRewardDefault) ? 'changed' : ''}`}
                disabled={stakingRewardLoading || !stakingReward}
              >
                {stakingRewardLoading ? 'Updating...' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      </div>
      <h1 className="list-heading">Announcements</h1>
      <div className="announcements-list">        
        <table className="announcement-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Title</th>
              <th className="hide-on-mobile">Description</th>
              <th className="hide-on-mobile">Date Posted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {announcements.map((announcement, index) => (
              <tr key={announcement.id}>
                <td>{String(index + 1).padStart(2, '0')}</td>
                <td>{announcement.heading}</td>
                <td className="hide-on-mobile">
                  <span 
                    title={announcement.description}
                    style={{
                      display: 'block',
                      maxWidth: '30rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {announcement.description}
                  </span>
                  </td>
                <td className="hide-on-mobile">{formatDate(String(announcement.modified))}</td>
                <td>
                  <button 
                    className="announcement-update-button"
                    onClick={() => openUpdateModal(announcement)}
                    disabled={loading}
                  >
                    Update
                  </button>
                </td>
              </tr>
            ))}
            {announcements.length === 0 && !loading && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>
                  No announcements found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {isModalOpen && currentAnnouncement && (
          <div className="modal-overlay">
            <div className="update-modal">
              <div className="modal-header">
                <h2>Update Announcement</h2>
                <button className="close-button" onClick={closeModal} disabled={loading}>×</button>
              </div>
              
              <label className="image-upload">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange}
                  className="file-input"
                  disabled={loading}
                />
                {previewUrl ? (
                  <div className="preview-container">
                    <img src={previewUrl} alt="Preview" />
                  </div>
                ) : currentAnnouncement.imageUrl ? (
                  <div className="preview-container">
                    <img src={currentAnnouncement.imageUrl} alt="Current" />
                  </div>
                ) : (
                  <div className="addImagePlaceholder">
                    <span className="plus-icon">+</span>
                    <span>Add Image</span>
                  </div>
                )}
              </label>
              
              <input
                type="text"
                value={currentAnnouncement.title || ''}
                onChange={(e) => setCurrentAnnouncement({...currentAnnouncement, title: e.target.value})}
                className="title-input"
                placeholder="Title"
                disabled={loading}
              />
              
              <textarea
                value={currentAnnouncement.description || ''}
                onChange={(e) => setCurrentAnnouncement({...currentAnnouncement, description: e.target.value})}
                className="description-input"
                placeholder="Description"
                rows={4}
                disabled={loading}
                maxLength={DESCRIPTION_CHAR_LIMIT}
              />
              <div className="character-count" style={{ textAlign: 'right', fontSize: '0.8rem', color: '#666', marginTop: '0.1rem', marginBottom: '0.3rem' }}>
                {DESCRIPTION_CHAR_LIMIT - (currentAnnouncement.description || '').length} characters left
              </div>
              
              <div className="modal-butons">
                <button 
                  className="update-announcement-button"
                  onClick={handleUpdateAnnouncement}
                  disabled={updateAnnouncementLoading}
                >
                  {updateAnnouncementLoading ? 'Updating...' : 'Update announcement'}
                </button>
                <button
                  className="delete-announcement-button"
                  onClick={() => handleDeleteAnnouncement(currentAnnouncement.id)}
                  disabled={deleteAnnouncementLoading}
                >
                  {deleteAnnouncementLoading ? 'Deleting...' : 'Delete announcement'}
                </button>
              </div>
              
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;