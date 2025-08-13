'use client';
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import feeMediator from '../../../../abis/FeeMediator.json';
import { ToastContainer, toast } from 'react-toastify';
import "./admin-list.scss";
import { User } from "@/app/models/User";

export function AdminList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [admins, setAdmins] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAdminPublicKey, setNewAdminPublicKey] = useState<string>("");
  const [ownerPublicKey, setOwnerPublicKey] = useState<string>('');

  const openModal = () => {
    setIsModalOpen(true);
    setNewKey('');
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };


  const handleDelete = (id: number) => {
    // Filter out the admin with the specified id
    const updatedAdmins = admins.filter(admin => admin.id !== id);
    
    // Renumber the serial numbers
    const renumberedAdmins = updatedAdmins.map((admin, index) => ({
      ...admin,
      serialNo: String(index + 1).padStart(2, '0')
    }));
    
    setAdmins(renumberedAdmins);
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Public key copied to clipboard")
  };

  useEffect(() => {    
    fetchOwnerPublicKey();
    fetchAdmins();
  }, []);

  const fetchOwnerPublicKey = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${process.env.NEXT_PUBLIC_APIURL}/configuration/get/?key=OWNER_PUBLIC_KEY`, {
        method: 'GET',
        headers: {
          "Authorization": `Bearer ${token}`
        },
        
      });
      if (!res.ok) {
        throw new Error("Failed to fetch owner public key");
      }
      const data = await res.json();      
      setOwnerPublicKey(String(data.value));
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "An unexpected error occurred.");
    }
  };

  const addAdminToContract = async (newAdminAddress: string) => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const mediatorContract = new ethers.Contract(
      feeMediator.address || "",
      feeMediator.abi,
      signer
    );

    try {
      const tx = await mediatorContract.addAdmin(newAdminAddress);

      await tx.wait();
    } catch (err) {
      console.error("Error in adding admin:", err);
      throw new Error("Adding admin failed during contract interaction");
    }
  };

  const removeAdminFromContract = async (newAdminAddress: string) => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const mediatorContract = new ethers.Contract(
      feeMediator.address || "",
      feeMediator.abi,
      signer
    );

    try {
      const tx = await mediatorContract.removeAdmin(newAdminAddress);

      await tx.wait();
    } catch (err) {
      console.error("Error in removing admin:", err);
      throw new Error("Removing admin failed during contract interaction");
    }
  };

  const fetchAdmins = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${process.env.NEXT_PUBLIC_APIURL}/users/admins`, {
        method: 'GET',
        headers: {
          "Authorization": `Bearer ${token}`
        },
      });
      if (!res.ok) {
        throw new Error("Failed to fetch admins");
      }
      const admins: User[] = await res.json();
      setAdmins(admins);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const removeAdminAccess = async (publicKey: string) => {
    try {
      const token = localStorage.getItem("authToken");

      // Update contract
      await removeAdminFromContract(publicKey);

      const updateResponse = await fetch(`${process.env.NEXT_PUBLIC_APIURL}/users/?publicKey=${publicKey}`, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          access: "USER" // Change access from ADMIN to USER
        })
      });

      if (!updateResponse.ok) {
        throw new Error(`Failed to remove admin access for ${publicKey}`);
      }

      // Remove the admin from the local state
      setAdmins(prevAdmins => prevAdmins.filter(admin => admin.publicKey !== publicKey));
      toast.success("Removed admin access successfully");

    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "An unexpected error occurred.");
    }
  };

  const grantAdminAccess = async (publicKey: string) => {
    try {
      const token = localStorage.getItem("authToken");

      // Update Contract
      await addAdminToContract(publicKey);

      const updateResponse = await fetch(`${process.env.NEXT_PUBLIC_APIURL}/users/?publicKey=${publicKey}`, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          access: "ADMIN"
        })
      });

      if (!updateResponse.ok) {
        throw new Error(`Failed to grant admin access for ${publicKey}`);
      }

      // Fetch updated list of admins
      fetchAdmins();
      setNewAdminPublicKey(""); // Reset the input field after successful update
      toast.success("Admin access granted successfully");


    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "An unexpected error occurred.");
    }
  };

  return (
    <div className="admin-list">
      <ToastContainer/>
      <div className="admin-header">
        <h1>Admins</h1>
        <button className="add-admin-button" onClick={openModal}>
          + Add Admin
        </button>
      </div>
      
      <div className="admins-table-container">
        <table className="admins-table">
          <thead>
            <tr>
              <th className="hide-on-mobile">S.No</th>
              <th>Public Key</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin, i) => (
              <tr key={admin.id}>
                <td className="hide-on-mobile">{i + 1}</td>
                <td>
                  <div className="public-key-section">
                    <span className="public-key-text">{admin.publicKey}</span>
                    <button 
                      className="copy-button hide-on-mobile" 
                      onClick={() => handleCopyToClipboard(admin.publicKey)}
                    >
                      <img src="/copy-icon.svg" alt="copy icon"/>
                    </button>
                  </div>
                </td>
                <td>
                  {admin.publicKey.trim() !== ownerPublicKey.trim() && (
                    <button
                    className="delete-button hide-on-mobile"
                    onClick={() => removeAdminAccess(admin.publicKey)}
                  >
                    Delete
                  </button>
                  )}
                  
                  <div className="buttons-section hide-on-laptop">
                    <button 
                      className="copy-button" 
                      onClick={() => handleCopyToClipboard(admin.publicKey)}
                    >
                      <img src="/copy-icon.svg" alt="copy icon"/>
                    </button>
                    {admin.publicKey.trim() !== ownerPublicKey.trim() && (
                      <button 
                      className="delete-button" 
                      onClick={() => removeAdminAccess(admin.publicKey)}
                    >
                      <img src="/delete-icon.svg" alt="delete icon"/>
                    </button>
                    )}
                    
                  </div> 
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="add-key-modal">
            <div className="modal-header">
              <h2>Add Key</h2>
              <button className="close-button" onClick={closeModal}>×</button>
            </div>
            
            <input
              type="text"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="Add your key"
              className="key-input"
            />
            
            <button 
              className="upload-button"
              onClick={() => grantAdminAccess(newKey)}
            >
              Add Admin
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminList;