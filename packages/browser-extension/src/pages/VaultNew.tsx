/**
 * Vault Page (Redesigned)
 * Main vault view with two-panel layout
 */

import { useState, useEffect } from 'react';
import { TopBar } from '../components/TopBar';
import { ServiceIconsBar } from '../components/ServiceIconsBar';
import { SuggestionsSection } from '../components/SuggestionsSection';
import { ItemDetailView } from '../components/ItemDetailView';
import { MenuDropdown } from '../components/MenuDropdown';
import { PasswordGeneratorNew } from '../components/PasswordGeneratorNew';
import { CredentialForm } from '../components/CredentialForm';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { UpdatePasswordDialog } from '../components/UpdatePasswordDialog';
import { useAppStore } from '../store/appStore';
import { authService } from '../services/auth';
import { vaultService, type DecryptedItem } from '../services/vault';
import type { VaultItemType } from '@iforgotpassword/shared-types';

export function VaultNew() {
  const { userEmail, lock, encryptionKey, setView, logout } = useAppStore();
  const [items, setItems] = useState<DecryptedItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<DecryptedItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState('');

  // Selected item
  const [selectedItem, setSelectedItem] = useState<DecryptedItem | null>(null);

  // UI state
  const [showMenu, setShowMenu] = useState(false);
  const [showPasswordGenerator, setShowPasswordGenerator] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingItem, setEditingItem] = useState<DecryptedItem | null>(null);

  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  // Update password dialog state
  const [showUpdatePassword, setShowUpdatePassword] = useState(false);
  const [updatePasswordItem, setUpdatePasswordItem] = useState<DecryptedItem | null>(null);

  // Load vault items on mount
  useEffect(() => {
    loadVaultItems();
  }, []);

  // Filter items when search query changes
  useEffect(() => {
    filterItems();
  }, [searchQuery, items]);

  const loadVaultItems = async (shouldSync = true) => {
    if (!encryptionKey) {
      setError('Encryption key not available');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      // First, try to sync with server to get latest data
      if (shouldSync && navigator.onLine) {
        console.log('[VAULT] Syncing with server on load...');
        try {
          await vaultService.syncWithServer();
        } catch (syncError) {
          console.warn('[VAULT] Sync failed, loading local data:', syncError);
        }
      }

      const loadedItems = await vaultService.getAllItems(encryptionKey);
      setItems(loadedItems);
      console.log(`[VAULT] Loaded ${loadedItems.length} items`);
    } catch (error) {
      console.error('Failed to load vault items:', error);
      setError('Failed to load vault items');
    } finally {
      setIsLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = items;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((item) => {
        const data = item.data as any;

        // Search in title
        if (data.title && data.title.toLowerCase().includes(query)) return true;

        // Search in username/email
        if (data.username && data.username.toLowerCase().includes(query)) return true;
        if (data.email && data.email.toLowerCase().includes(query)) return true;

        // Search in URL
        if (data.url && data.url.toLowerCase().includes(query)) return true;

        // Search in notes
        if (data.notes && data.notes.toLowerCase().includes(query)) return true;

        return false;
      });
    }

    setFilteredItems(filtered);
  };

  const handleSync = async () => {
    if (!encryptionKey) return;

    try {
      setIsSyncing(true);
      setError('');
      await vaultService.syncWithServer();
      await loadVaultItems(false);
    } catch (error) {
      console.error('Failed to sync:', error);
      setError('Failed to sync with server');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLock = async () => {
    await authService.lock();
    lock();
  };

  const handleLogout = async () => {
    await authService.logout();
    logout();
  };

  const handleAddNew = () => {
    setFormMode('create');
    setEditingItem(null);
    setShowForm(true);
  };

  const handleEdit = (item: DecryptedItem) => {
    setFormMode('edit');
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setDeletingItemId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deletingItemId) return;

    try {
      setError('');
      await vaultService.deleteItem(deletingItemId);
      setItems((prev) => prev.filter((item) => item.id !== deletingItemId));
      if (selectedItem?.id === deletingItemId) {
        setSelectedItem(null);
      }
      setShowDeleteConfirm(false);
      setDeletingItemId(null);
    } catch (error) {
      console.error('Failed to delete item:', error);
      setError('Failed to delete item');
    }
  };

  const handleSaveItem = async (type: VaultItemType, data: any) => {
    if (!encryptionKey) {
      setError('Encryption key not available');
      return;
    }

    try {
      setError('');

      if (formMode === 'create') {
        const newItem = await vaultService.createItem(type, data, encryptionKey);
        setItems((prev) => [...prev, newItem]);
        setSelectedItem(newItem);
      } else if (formMode === 'edit' && editingItem) {
        const updatedItem = await vaultService.updateItem(
          editingItem.id,
          type,
          data,
          encryptionKey
        );
        setItems((prev) =>
          prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
        );
        if (selectedItem?.id === updatedItem.id) {
          setSelectedItem(updatedItem);
        }
      }

      setShowForm(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Failed to save item:', error);
      setError('Failed to save item');
    }
  };

  const handleItemClick = (item: DecryptedItem) => {
    setSelectedItem(item);
  };

  const handleGeneratePasswordClick = () => {
    setShowPasswordGenerator(true);
  };

  // Get icon for item
  const getItemIcon = (item: DecryptedItem): string => {
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

  // Get item title
  const getItemTitle = (item: DecryptedItem): string => {
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

  // Get item subtitle
  const getItemSubtitle = (item: DecryptedItem): string => {
    const data = item.data as any;
    if (item.type === 'login') return data.url || data.email || '';
    if (item.type === 'card') {
      const number = data.number || '';
      if (number.length >= 4) {
        return `${number.slice(0, 4)} •••• ${number.slice(-4)}`;
      }
      return number;
    }
    if (item.type === 'identity') {
      const address = data.address || {};
      return address.street || '';
    }
    return '';
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading vault...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Top Bar */}
      <TopBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddClick={handleAddNew}
        onMenuClick={() => setShowMenu(!showMenu)}
      />

      {/* Service Icons Bar */}
      <ServiceIconsBar onServiceClick={(service) => console.log('Service clicked:', service)} />

      {/* Main Content - Two Panel Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="vault-sidebar overflow-y-auto">
          {/* All Items Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="font-medium text-gray-900">All items</span>
            </div>
            <button className="icon-btn" title="Filter">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </button>
          </div>

          {/* Suggestions Section */}
          <SuggestionsSection items={filteredItems} onItemClick={handleItemClick} />

          {/* All Items Section */}
          <div className="px-4 py-3 border-t border-gray-200">
            <div className="text-xs font-semibold text-gray-500 mb-2">All items</div>
          </div>

          {/* Items List */}
          <div>
            {filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`list-item w-full text-left ${
                  selectedItem?.id === item.id ? 'list-item-selected' : ''
                }`}
              >
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xl">
                  {getItemIcon(item)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {getItemTitle(item)}
                  </div>
                  <div className="text-xs text-gray-500 truncate">{getItemSubtitle(item)}</div>
                </div>
              </button>
            ))}

            {/* Generate Password Option */}
            <button
              onClick={handleGeneratePasswordClick}
              className="list-item w-full text-left"
            >
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900">Generate Password</div>
                <div className="text-xs text-gray-500">Create strong password</div>
              </div>
            </button>

            {filteredItems.length === 0 && searchQuery && (
              <div className="px-4 py-8 text-center text-gray-500 text-sm">
                No items match your search
              </div>
            )}

            {items.length === 0 && !searchQuery && (
              <div className="px-4 py-8 text-center text-gray-500 text-sm">
                Your vault is empty. Click the + button to add an item.
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Detail View */}
        <ItemDetailView
          item={selectedItem}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* Menu Dropdown */}
      <MenuDropdown
        isOpen={showMenu}
        onClose={() => setShowMenu(false)}
        onSync={handleSync}
        onSettings={() => setView('settings')}
        onLock={handleLock}
        onLogout={handleLogout}
      />

      {/* Password Generator Modal */}
      {showPasswordGenerator && (
        <PasswordGeneratorNew
          onPasswordSelect={(password) => {
            console.log('Password generated:', password);
            setShowPasswordGenerator(false);
          }}
          onClose={() => setShowPasswordGenerator(false)}
        />
      )}

      {/* Credential Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <CredentialForm
              mode={formMode}
              item={editingItem}
              onSave={handleSaveItem}
              onCancel={() => {
                setShowForm(false);
                setEditingItem(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <ConfirmDialog
          title="Delete Item"
          message="Are you sure you want to delete this item? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setDeletingItemId(null);
          }}
        />
      )}

      {/* Update Password Dialog */}
      <UpdatePasswordDialog
        isOpen={showUpdatePassword}
        item={updatePasswordItem}
        newPassword=""
        onUpdate={() => {
          setShowUpdatePassword(false);
          setUpdatePasswordItem(null);
        }}
        onDismiss={() => {
          setShowUpdatePassword(false);
          setUpdatePasswordItem(null);
        }}
      />

      {/* Error Message */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {error}
        </div>
      )}

      {/* Syncing Message */}
      {isSyncing && (
        <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>Syncing...</span>
        </div>
      )}
    </div>
  );
}
