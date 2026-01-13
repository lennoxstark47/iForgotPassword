/**
 * SuggestionsSection Component
 * Displays suggested items for quick access
 */

import type { DecryptedItem } from '../services/vault';

interface SuggestionsSectionProps {
  items: DecryptedItem[];
  onItemClick: (item: DecryptedItem) => void;
}

export function SuggestionsSection({ items, onItemClick }: SuggestionsSectionProps) {
  // Get icon based on item type
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
      return address.type === 'home' ? 'Home Address' : 'Work Address';
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

  if (items.length === 0) return null;

  return (
    <div className="px-4 py-3">
      <div className="text-xs font-semibold text-gray-500 mb-2">Suggestion</div>
      <div className="space-y-2">
        {items.slice(0, 3).map((item) => (
          <button
            key={item.id}
            className="suggestion-card w-full text-left"
            onClick={() => onItemClick(item)}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-xl">
                {getItemIcon(item)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {getItemTitle(item)}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {getItemSubtitle(item)}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
