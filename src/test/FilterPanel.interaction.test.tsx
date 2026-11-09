import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { FilterPanel } from '../components/FilterPanel';
import type { Status, Priority } from '../types/ticket';

const defaultProps = {
  filterStatus: '' as Status | '',
  setFilterStatus: vi.fn(),
  filterPriority: '' as Priority | '',
  setFilterPriority: vi.fn(),
  search: '',
  setSearch: vi.fn(),
  sortBy: 'createdAt' as const,
  setSortBy: vi.fn(),
};

describe('FilterPanel - priority and sort callbacks', () => {
  it('setFilterPriority is called with the new value when priority select changes', () => {
    const setFilterPriority = vi.fn();
    const { container } = render(
      <FilterPanel {...defaultProps} setFilterPriority={setFilterPriority} />
    );
    const select = within(container).getByTestId('filter-priority');
    fireEvent.change(select, { target: { value: 'high' } });
    expect(setFilterPriority).toHaveBeenCalledWith('high');
  });

  it('setFilterPriority is called for each priority value', () => {
    const priorities: Priority[] = ['low', 'medium', 'high', 'critical'];
    priorities.forEach(priority => {
      const setFilterPriority = vi.fn();
      const { container, unmount } = render(
        <FilterPanel {...defaultProps} setFilterPriority={setFilterPriority} />
      );
      try {
        const select = within(container).getByTestId('filter-priority');
        fireEvent.change(select, { target: { value: priority } });
        expect(setFilterPriority).toHaveBeenCalledWith(priority);
      } finally {
        unmount();
      }
    });
  });

  it('setSortBy is called with the new value when sort-by select changes', () => {
    const setSortBy = vi.fn();
    const { container } = render(
      <FilterPanel {...defaultProps} setSortBy={setSortBy} />
    );
    const select = within(container).getByTestId('sort-by');
    fireEvent.change(select, { target: { value: 'priority' } });
    expect(setSortBy).toHaveBeenCalledWith('priority');
  });

  it('setSortBy is called for each sort option', () => {
    const sortOptions = ['createdAt', 'priority', 'status'] as const;
    sortOptions.forEach(sortBy => {
      const setSortBy = vi.fn();
      const { container, unmount } = render(
        <FilterPanel {...defaultProps} setSortBy={setSortBy} />
      );
      try {
        const select = within(container).getByTestId('sort-by');
        fireEvent.change(select, { target: { value: sortBy } });
        expect(setSortBy).toHaveBeenCalledWith(sortBy);
      } finally {
        unmount();
      }
    });
  });

  it('sort-by select reflects current sortBy prop', () => {
    const { container } = render(
      <FilterPanel {...defaultProps} sortBy="status" />
    );
    const select = within(container).getByTestId('sort-by') as HTMLSelectElement;
    expect(select.value).toBe('status');
  });

  it('filter-priority select reflects current filterPriority prop', () => {
    const { container } = render(
      <FilterPanel {...defaultProps} filterPriority="critical" />
    );
    const select = within(container).getByTestId('filter-priority') as HTMLSelectElement;
    expect(select.value).toBe('critical');
  });
});
