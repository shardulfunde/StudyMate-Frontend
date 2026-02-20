import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useCapabilities } from '../context/CapabilityContext';
import { buildPermissions } from '../utils/permissions';
import RoleManager from '../components/RoleManager';
import StructureManager from '../components/StructureManager';
import AdminUploadManager from '../components/AdminUploadManager';
import './AdminPanel.css';

export default function AdminPanel() {
  const { capabilities } = useCapabilities();
  const permissions = buildPermissions(capabilities);

  if (!permissions.hasAdminAccess()) {
    return <Navigate to="/" replace />;
  }

  const canManageStructure = permissions.canManageStructure();
  const canManageRoles = permissions.canManageRoles();
  const canUploadNotes = permissions.canManageResourceSubject();
  const [activeTab, setActiveTab] = useState("structure");

  useEffect(() => {
    if (!canManageStructure && canManageRoles) {
      setActiveTab("roles");
      return;
    }
    if (!canManageStructure && !canManageRoles && canUploadNotes) {
      setActiveTab("notes-upload");
    }
  }, [canManageStructure, canManageRoles, canUploadNotes]);

  return (
    <div className="admin-panel">
      <div className="admin-panel__container">
        <div className="admin-header">
          <h1 className="admin-title">Admin Panel</h1>
          <p className="admin-subtitle">
            Manage academic structure and access roles from a single workspace.
          </p>
        </div>

        <div className="admin-tabs">
          {canManageStructure && (
            <button
              type="button"
              className={`admin-tab ${activeTab === "structure" ? "active" : ""}`}
              onClick={() => setActiveTab("structure")}
            >
              Structure Management
            </button>
          )}
          {canManageRoles && (
            <button
              type="button"
              className={`admin-tab ${activeTab === "roles" ? "active" : ""}`}
              onClick={() => setActiveTab("roles")}
            >
              Role Management
            </button>
          )}
          {canUploadNotes && (
            <button
              type="button"
              className={`admin-tab ${activeTab === "notes-upload" ? "active" : ""}`}
              onClick={() => setActiveTab("notes-upload")}
            >
              Notes Upload
            </button>
          )}
        </div>

        <div className="admin-tab-panel">
          {activeTab === "structure" && canManageStructure && (
            <StructureManager />
          )}

          {activeTab === "roles" && canManageRoles && (
            <RoleManager />
          )}

          {activeTab === "notes-upload" && canUploadNotes && (
            <AdminUploadManager />
          )}
        </div>
      </div>
    </div>
  );
}
