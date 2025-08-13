'use client';
import { useEffect, useState } from "react";
import "./configurations.scss";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Configuration } from "@/app/models/Configuration";


export function Configurations() {
  const [configs, setConfigs] = useState<Configuration[]>([]);
  const [newConfigKey, setNewConfigKey] = useState<string>("");
  const [newConfigValue, setNewConfigValue] = useState<string>("");

  useEffect(() => {
    fetchConfigurations();
  }, []);

  const fetchConfigurations = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${process.env.NEXT_PUBLIC_APIURL}/configuration/getAll`, {
        method: 'GET',
        headers: {
          "Authorization": `Bearer ${token}`
        },
      });
      if (!res.ok) {
        throw new Error("Failed to fetch configurations");
      }
      const configs: Configuration[] = await res.json();
      setConfigs(configs);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "An unexpected error occurred.");
    }
  };

  const deleteConfiguration = async (key: string) => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${process.env.NEXT_PUBLIC_APIURL}/configuration`, {
        method: 'DELETE',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ key })
      });

      if (!res.ok) {
        throw new Error(`Failed to delete configuration with key: ${key}`);
      }

      setConfigs(prevConfigs => prevConfigs.filter(config => config.key !== key));
      toast.success("Configuration deleted successfully");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "An unexpected error occurred.");
    }
  };

  const updateConfiguration = async (key: string, newValue: string) => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${process.env.NEXT_PUBLIC_APIURL}/configuration`, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ key, value: newValue })
      });

      if (!res.ok) {
        throw new Error(`Failed to update configuration with key: ${key}`);
      }

      fetchConfigurations();
      toast.success("Configuration updated successfully");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "An unexpected error occurred.");
    }
  };

  const createConfiguration = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${process.env.NEXT_PUBLIC_APIURL}/configuration`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ key: newConfigKey, value: newConfigValue })
      });

      if (!res.ok) {
        throw new Error("Failed to create a new configuration");
      }

      fetchConfigurations();
      setNewConfigKey("");
      setNewConfigValue("");
      toast.success("Configuration created successfully");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "An unexpected error occurred.");
    }
  };

  return (
    <div className="configurationSection">
      {/* <ToastContainer /> */}
      <h2>Configuration Dashboard</h2>

      <table className="configurationTable">
        <thead>
          <tr>
            <th>Key</th>
            <th>Value</th>
            <th>Created</th>
            <th>Modified</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {configs.map(config => (
            <tr key={config.key}>
              <td>{config.key}</td>
              <td>
                <input 
                  type="text"
                  value={config.value}
                  onChange={(e) => setConfigs((prevConfigs) => 
                    prevConfigs.map(c => 
                      c.key === config.key ? {...c, value: e.target.value} : c
                    )
                  )}
                />
              </td>
              <td>{new Date(config.created).toLocaleDateString()}</td>
              <td>{new Date(config.modified).toLocaleDateString()}</td>
              <td>
                <button className="delete-button" onClick={() => deleteConfiguration(config.key)}>Delete</button>
                <button className="edit-button" onClick={() => updateConfiguration(config.key, config.value)}>Update</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="createConfigSection">
        <h3>Create New Configuration</h3>
        <form onSubmit={createConfiguration}>
          <input
            type="text"
            value={newConfigKey}
            onChange={(e) => setNewConfigKey(e.target.value)}
            placeholder="Configuration Key"
            required
          />
          <input
            type="text"
            value={newConfigValue}
            onChange={(e) => setNewConfigValue(e.target.value)}
            placeholder="Configuration Value"
            required
          />
          <button className="create-button" type="submit">Create</button>
        </form>
      </div>
    </div>
  );
}

export default Configurations;