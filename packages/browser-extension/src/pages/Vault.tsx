/**
 * Vault Page
 * Main vault view with full CRUD operations
 */

import { useState, useEffect } from 'react';
import { Logo } from '../components/Logo';
import { Loading } from '../components/Loading';
import { VaultItemCard } from '../components/VaultItemCard';
import { CredentialForm } from '../components/CredentialForm';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useAppStore } from '../store/appStore';
import { authService } from '../services/auth';
import { vaultService, type DecryptedItem } from '../services/vault';
import type { VaultItemType } from '@iforgotpassword/shared-types';

export function Vault() {
  const { userEmail, lock, encryptionKey, setView } = useAppStore();
  const [items, setItems] = useState<DecryptedItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<DecryptedItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<VaultItemType | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingItem, setEditingItem] = useState<DecryptedItem | null>(null);

  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  // Load vault items on mount
  useEffect(() => {
    loadVaultItems();
  }, []);

  // Filter items when search query or filter type changes
  useEffect(() => {
    filterItems();
  }, [searchQuery, filterType, items]);

  const loadVaultItems = async () => {
    if (!encryptionKey) {
      setError('Encryption key not available');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      const loadedItems = await vaultService.getAllItems(encryptionKey);
      setItems(loadedItems);
    } catch (error) {
      console.error('Failed to load vault items:', error);
      setError('Failed to load vault items');
    } finally {
      setIsLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = items;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter((item) => item.type === filterType);
    }

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
      await loadVaultItems();
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
      }

      setShowForm(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Failed to save item:', error);
      setError('Failed to save item');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Logo size="sm" />
            <div className="flex items-center gap-2">
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                title="Sync with server"
              >
                <svg
                  className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
              <button
                onClick={() => setView('settings')}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Settings"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
              <button
                onClick={handleLock}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Lock Vault"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search vault items..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg
                className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as VaultItemType | 'all')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Items</option>
              <option value="login">Logins</option>
              <option value="note">Notes</option>
              <option value="card">Cards</option>
              <option value="identity">Identities</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loading />
            <p className="mt-4 text-gray-600">Loading your vault...</p>
          </div>
        ) : (
          <>
            {/* Add New Button */}
            <button
              onClick={handleAddNew}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium mb-6 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Item
            </button>

            {/* Vault Items */}
            {filteredItems.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchQuery || filterType !== 'all' ? 'No items found' : 'Your vault is empty'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery || filterType !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Get started by adding your first credential'}
                </p>
                {!searchQuery && filterType === 'all' && (
                  <button
                    onClick={handleAddNew}
                    className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Add Your First Item
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 mb-3">
                  {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
                </p>
                {filteredItems.map((item) => (
                  <VaultItemCard
                    key={item.id}
                    item={item}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Credential Form Modal */}
      <CredentialForm
        isOpen={showForm}
        mode={formMode}
        itemType={editingItem?.type || 'login'}
        initialData={editingItem?.data}
        onSave={handleSaveItem}
        onCancel={() => {
          setShowForm(false);
          setEditingItem(null);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Item"
        message="Are you sure you want to delete this item? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setDeletingItemId(null);
        }}
      />

      {/* Footer */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="bg-white rounded-lg shadow-sm px-4 py-3">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Vault Unlocked • {userEmail}</span>
            </div>
            <span>v1.0.0 (Week 3-4)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
