/**
 * TopBar Component
 * Top navigation bar with add button, search, and menu
 */

interface TopBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddClick: () => void;
  onMenuClick: () => void;
}

export function TopBar({
  searchQuery,
  onSearchChange,
  onAddClick,
  onMenuClick,
}: TopBarProps) {
  return (
    <div className="top-bar">
      {/* Add button */}
      <button
        onClick={onAddClick}
        className="icon-btn-primary"
        title="Add new item"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>

      {/* Search bar */}
      <div className="search-bar">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
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
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input pl-10"
          />
        </div>
      </div>

      {/* Menu button */}
      <button
        onClick={onMenuClick}
        className="icon-btn"
        title="Menu"
      >
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>
    </div>
  );
}
