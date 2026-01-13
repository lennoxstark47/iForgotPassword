/**
 * ItemDetailView Component
 * Displays detailed view of a vault item on the right panel
 */

import { useState } from 'react';
import type { DecryptedItem } from '../services/vault';

interface ItemDetailViewProps {
  item: DecryptedItem | null;
  onEdit: (item: DecryptedItem) => void;
  onDelete: (id: string) => void;
  onFillForm?: (item: DecryptedItem) => void;
}

export function ItemDetailView({ item, onEdit, onDelete, onFillForm }: ItemDetailViewProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!item) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-lg font-medium">No item selected</p>
          <p className="text-sm mt-1">Select an item to view details</p>
        </div>
      </div>
    );
  }

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const renderLoginDetails = () => {
    const data = item.data as any;
    return (
      <>
        {data.username && (
          <div className="detail-field">
            <label className="detail-label">Username</label>
            <div className="flex items-center gap-2">
              <div className="detail-value flex-1">{data.username}</div>
              <button
                onClick={() => copyToClipboard(data.username, 'username')}
                className="icon-btn"
                title="Copy"
              >
                {copiedField === 'username' ? '✓' : '📋'}
              </button>
            </div>
          </div>
        )}

        {data.password && (
          <div className="detail-field">
            <label className="detail-label">Password</label>
            <div className="flex items-center gap-2">
              <div className="detail-value flex-1 font-mono">
                {showPassword ? data.password : '••••••••'}
              </div>
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="icon-btn"
                title={showPassword ? 'Hide' : 'Show'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
              <button
                onClick={() => copyToClipboard(data.password, 'password')}
                className="icon-btn"
                title="Copy"
              >
                {copiedField === 'password' ? '✓' : '📋'}
              </button>
            </div>
          </div>
        )}

        {data.url && (
          <div className="detail-field">
            <label className="detail-label">URL</label>
            <div className="detail-value text-blue-600 truncate">
              <a href={data.url} target="_blank" rel="noopener noreferrer">
                {data.url}
              </a>
            </div>
          </div>
        )}

        {data.notes && (
          <div className="detail-field">
            <label className="detail-label">Notes</label>
            <div className="detail-value whitespace-pre-wrap">{data.notes}</div>
          </div>
        )}
      </>
    );
  };

  const renderCardDetails = () => {
    const data = item.data as any;
    return (
      <>
        {data.cardholderName && (
          <div className="detail-field">
            <label className="detail-label">Cardholder Name</label>
            <div className="detail-value">{data.cardholderName}</div>
          </div>
        )}

        {data.type && (
          <div className="detail-field">
            <label className="detail-label">Type</label>
            <div className="detail-value">{data.type}</div>
          </div>
        )}

        {data.number && (
          <div className="detail-field">
            <label className="detail-label">Number</label>
            <div className="flex items-center gap-2">
              <div className="detail-value flex-1 font-mono">
                {data.number.slice(0, 4)} •••• {data.number.slice(-4)}
              </div>
              <button
                onClick={() => copyToClipboard(data.number, 'number')}
                className="icon-btn"
                title="Copy"
              >
                {copiedField === 'number' ? '✓' : '📋'}
              </button>
            </div>
          </div>
        )}

        {data.cvv && (
          <div className="detail-field">
            <label className="detail-label">Verification Number</label>
            <div className="flex items-center gap-2">
              <div className="detail-value flex-1 font-mono">•••••••</div>
              <button
                onClick={() => copyToClipboard(data.cvv, 'cvv')}
                className="icon-btn"
                title="Copy"
              >
                {copiedField === 'cvv' ? '✓' : '📋'}
              </button>
            </div>
          </div>
        )}

        {data.expiryDate && (
          <div className="detail-field">
            <label className="detail-label">Expiration Date</label>
            <div className="detail-value">{data.expiryDate}</div>
          </div>
        )}
      </>
    );
  };

  const renderIdentityDetails = () => {
    const data = item.data as any;
    const address = data.address || {};
    return (
      <>
        {data.firstName && (
          <div className="detail-field">
            <label className="detail-label">Name</label>
            <div className="detail-value">
              {data.firstName} {data.middleName} {data.lastName}
            </div>
          </div>
        )}

        {data.email && (
          <div className="detail-field">
            <label className="detail-label">Email</label>
            <div className="detail-value">{data.email}</div>
          </div>
        )}

        {data.phone && (
          <div className="detail-field">
            <label className="detail-label">Phone</label>
            <div className="detail-value">{data.phone}</div>
          </div>
        )}

        {address.street && (
          <div className="detail-field">
            <label className="detail-label">Address</label>
            <div className="detail-value">
              {address.street}
              {address.city && <>, {address.city}</>}
              {address.state && <>, {address.state}</>}
              {address.postalCode && <> {address.postalCode}</>}
              {address.country && <>, {address.country}</>}
            </div>
          </div>
        )}
      </>
    );
  };

  const renderNoteDetails = () => {
    const data = item.data as any;
    return (
      <>
        {data.content && (
          <div className="detail-field">
            <label className="detail-label">Content</label>
            <div className="detail-value whitespace-pre-wrap">{data.content}</div>
          </div>
        )}
      </>
    );
  };

  const getItemIcon = (): string => {
    switch (item.type) {
      case 'login':
        return '🔐';
      case 'card':
        return '💳';
      case 'identity':
        return '👤';
      case 'note':
        return '📝';
      default:
        return '📄';
    }
  };

  const getItemTitle = (): string => {
    const data = item.data as any;
    if (item.type === 'login') return data.title || data.username || 'Login';
    if (item.type === 'card') return 'Credit Card';
    if (item.type === 'identity') {
      const address = data.address || {};
      return address.type === 'home' ? 'Home Address' : 'Identity';
    }
    if (item.type === 'note') return data.title || 'Note';
    return 'Item';
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
              {getItemIcon()}
            </div>
            <h2 className="text-xl font-semibold text-gray-900">{getItemTitle()}</h2>
          </div>
          <button className="icon-btn" title="More options">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          {item.type === 'login' && onFillForm && (
            <button
              onClick={() => onFillForm(item)}
              className="btn-primary"
            >
              Fill Form
            </button>
          )}
          <button
            onClick={() => onEdit(item)}
            className="btn-secondary"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="btn-secondary text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="flex-1 overflow-y-auto p-6">
        {item.type === 'login' && renderLoginDetails()}
        {item.type === 'card' && renderCardDetails()}
        {item.type === 'identity' && renderIdentityDetails()}
        {item.type === 'note' && renderNoteDetails()}

        {/* Metadata */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            <div className="mb-1">
              Created: {new Date(item.createdAt).toLocaleDateString()}
            </div>
            <div>
              Modified: {new Date(item.updatedAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
