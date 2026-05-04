import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';
import { api } from '../api/client';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageId: string;
  pageWorkspaceId: string | null;
  pageTitle: string;
}

export default function ShareModal({ isOpen, onClose, pageId, pageWorkspaceId, pageTitle }: ShareModalProps) {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'editor' | 'viewer'>('editor');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [shareLink, setShareLink] = useState('');

  const handleInvite = async () => {
    if (!email) {
      setError('Please enter an email address');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let workspaceId = pageWorkspaceId;
      
      // If page is personal (no workspace), create a workspace first
      if (!workspaceId) {
        const workspaceResponse = await api.post('/workspace', {
          name: `${pageTitle} - Shared`,
          description: `Workspace created from page: ${pageTitle}`,
          icon: '🔗'
        });

        if (!workspaceResponse.data) {
          throw new Error('Failed to create workspace');
        }

        const workspace = workspaceResponse.data;
        workspaceId = workspace.id;

        // Update page to belong to new workspace
        await api.put(`/page/${pageId}`, {
          workspaceId: workspaceId
        });
      }

      // Invite user to workspace
      const inviteResponse = await api.post(`/workspace/${workspaceId}/invite`, {
        email,
        role
      });

      if (!inviteResponse.data) {
        throw new Error('Failed to send invitation');
      }

      setSuccess(`Invitation sent to ${email}`);
      setEmail('');
    } catch (error: any) {
      setError(error.message || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateShareLink = async () => {
    const link = `${window.location.origin}/editor/${pageId}`;
    setShareLink(link);
    try {
      await navigator.clipboard.writeText(link);
      setSuccess('Share link copied to clipboard!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to copy link to clipboard');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'var(--surface)',
        borderRadius: '12px',
        padding: '32px',
        maxWidth: '520px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: 'var(--shadow)'
      }}>
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ margin: 0, color: 'var(--text)', fontSize: '24px', fontWeight: '600' }}>
            Share "{pageTitle}"
          </h2>
        </div>
        
        <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: 'var(--surface-2)', borderRadius: '8px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '500', color: 'var(--text)' }}>
            Share Link
          </h3>
          <button
            className="secondary-button"
            onClick={handleGenerateShareLink}
            style={{ 
              width: '100%',
              padding: '12px',
              fontSize: '14px',
              fontWeight: '500',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              backgroundColor: 'var(--surface)',
              color: 'var(--text)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--surface-3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--surface)';
            }}
          >
            Copy Share Link
          </button>
          {shareLink && (
            <div style={{ 
              marginTop: '12px', 
              padding: '8px', 
              backgroundColor: 'var(--success-bg)', 
              color: 'var(--success)', 
              borderRadius: '4px',
              fontSize: '13px'
            }}>
              Share link copied to clipboard!
            </div>
          )}
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '500', color: 'var(--text)' }}>
            Invite by Email
          </h3>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500', color: 'var(--text)' }}>
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: 'var(--surface)',
                color: 'var(--text)',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
            />
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500', color: 'var(--text)' }}>
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'editor' | 'viewer')}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: 'var(--surface)',
                color: 'var(--text)',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
            >
              <option value="editor">Editor - Can edit pages</option>
              <option value="viewer">Viewer - Can only view</option>
            </select>
          </div>

          <button
            className="primary-button"
            onClick={handleInvite}
            disabled={loading || !email}
            style={{ 
              width: '100%',
              padding: '12px',
              fontSize: '14px',
              fontWeight: '500',
              border: '1px solid var(--primary)',
              borderRadius: '6px',
              backgroundColor: loading || !email ? 'var(--muted)' : 'var(--primary)',
              color: 'white',
              cursor: loading || !email ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {loading ? 'Sending...' : 'Send Invitation'}
          </button>
        </div>

        {error && (
          <div style={{ 
            marginBottom: '16px', 
            padding: '12px', 
            backgroundColor: 'var(--danger-bg)', 
            color: 'var(--danger)', 
            borderRadius: '6px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}
        
        {success && (
          <div style={{ 
            marginBottom: '16px', 
            padding: '12px', 
            backgroundColor: 'var(--success-bg)', 
            color: 'var(--success)', 
            borderRadius: '6px',
            fontSize: '14px'
          }}>
            {success}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
          <button
            className="secondary-button"
            onClick={onClose}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: '500',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              backgroundColor: 'var(--surface)',
              color: 'var(--text)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--surface-2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--surface)';
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
