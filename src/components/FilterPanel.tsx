import type { Status, Priority } from '../types/ticket';

interface FilterPanelProps {
  filterStatus: Status | '';
  setFilterStatus: (v: Status | '') => void;
  filterPriority: Priority | '';
  setFilterPriority: (v: Priority | '') => void;
  search: string;
  setSearch: (v: string) => void;
  sortBy: 'createdAt' | 'priority' | 'status';
  setSortBy: (v: 'createdAt' | 'priority' | 'status') => void;
}

const selectStyle: React.CSSProperties = {
  padding: '6px 10px',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  fontSize: '13px',
  background: '#fff',
};

export function FilterPanel({
  filterStatus,
  setFilterStatus,
  filterPriority,
  setFilterPriority,
  search,
  setSearch,
  sortBy,
  setSortBy,
}: FilterPanelProps) {
  return (
    <div
      data-testid="filter-panel"
      style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}
    >
      <input
        data-testid="search-input"
        type="text"
        placeholder="Search tickets..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ ...selectStyle, minWidth: '200px', flex: 1 }}
      />
      <select
        data-testid="filter-status"
        value={filterStatus}
        onChange={e => setFilterStatus(e.target.value as Status | '')}
        style={selectStyle}
      >
        <option value="">All statuses</option>
        <option value="open">Open</option>
        <option value="in_progress">In Progress</option>
        <option value="resolved">Resolved</option>
        <option value="closed">Closed</option>
      </select>
      <select
        data-testid="filter-priority"
        value={filterPriority}
        onChange={e => setFilterPriority(e.target.value as Priority | '')}
        style={selectStyle}
      >
        <option value="">All priorities</option>
        <option value="critical">Critical</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>
      <select
        data-testid="sort-by"
        value={sortBy}
        onChange={e => setSortBy(e.target.value as 'createdAt' | 'priority' | 'status')}
        style={selectStyle}
      >
        <option value="createdAt">Sort: Newest</option>
        <option value="priority">Sort: Priority</option>
        <option value="status">Sort: Status</option>
      </select>
    </div>
  );
}
