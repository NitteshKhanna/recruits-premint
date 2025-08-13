'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "./admin.scss";
import AdminDashboard from "../components/admin/dashboard/page";
import AdminList from "../components/admin/admin-list/page";
import { User } from "@/app/models/User";
import { LoginData } from "@/app/models/loginData";

export function Admin() {
  const [loading, setLoading] = useState(true);
  const [newAdminPublicKey, setNewAdminPublicKey] = useState<string>("");
  const [activeTab, setActiveTab] = useState<'dashboard' | 'admins'>('dashboard');
  const [prevTab, setPrevTab] = useState<'dashboard' | 'admins'>('dashboard');
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  
  const router = useRouter();
  const apiurl = process.env.NEXT_PUBLIC_APIURL;

  const handleTabChange = (tab: 'dashboard' | 'admins') => {
    if (tab !== activeTab) {
      setPrevTab(activeTab);
      setActiveTab(tab);
    }
  };

  const checkAdminAccess = async () => {
    try {
      const loginDataStr = localStorage.getItem("loginData");
      
      if (!loginDataStr) {
        // No login data found, redirect to home
        router.push("/");
        return;
      }

      const loginData: LoginData = JSON.parse(loginDataStr);
      
      if (!loginData.user.publicKey || !loginData.token) {
        // Invalid login data, redirect to home
        router.push("/");
        return;
      }

      // Fetch user data from backend
      const response = await fetch(`${apiurl}/users/user/?publicKey=${loginData.user.publicKey}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${loginData.token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        
        if (userData.access === "ADMIN") {
          setIsAuthorized(true);
        } else {
          // User is not admin, redirect to home
          router.push("/");
        }
      } else {
        // Failed to fetch user data or invalid token, redirect to home
        router.push("/");
      }
    } catch (error) {
      console.error("Error checking admin access:", error);
      // Error occurred, redirect to home
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAdminAccess();
  }, []);

  // Show loading state while checking authorization
  if (loading) {
    return (
      <div className="admin-container socialsFooterPadding">
        <div className="loading-container" style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh',
          fontSize: '18px'
        }}>
          Loading...
        </div>
      </div>
    );
  }

  // If not authorized, this component won't render as user will be redirected
  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="admin-container socialsFooterPadding">
      <div className="tab-bar">
        <button 
          className={activeTab === 'dashboard' ? 'active' : ''}
          onClick={() => handleTabChange('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={activeTab === 'admins' ? 'active' : ''}
          onClick={() => handleTabChange('admins')}
        >
          Admins
        </button>
      </div>

      <div className="tab-content">
        {/* Both components are always rendered but only one is visible */}
        <div className={`tab-pane ${activeTab === 'dashboard' ? 'visible' : 'hidden'}`}>
          <AdminDashboard />
        </div>
        <div className={`tab-pane ${activeTab === 'admins' ? 'visible' : 'hidden'}`}>
          <AdminList />
        </div>
      </div>
    </div>
  );
}

export default Admin;