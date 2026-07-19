/**
 * Unit tests for FilterPanel component callbacks that are not exercised by
 * the existing property-based tests (setFilterPriority and setSortBy).
 *
 * These are deterministic unit tests targeting the specific onChange handlers
 * in FilterPanel.tsx (priority select and sort-by select).
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { FilterPanel } from '../components/FilterPanel';
import type { Status, Priority } from '../types/ticket';

const renderPanel = (overrides: Partial<{
  filterStatus: Status | '';
  setFilterStatus: (v: Status | '') => void;
  filterPriority: Priority | '';
  setFilterPriority: (v: Priority | '') => void;
  search: string;
  setSearch: (v: string) => void;
  sortBy: 'createdAt' | 'priority' | 'status';
  setSortBy: (v: 'createdAt' | 'priority' | 'status') => void;
}> = {}) => {
  const props = {
    filterStatus: '' as Status | '',
    setFilterStatus: vi.fn(),
    filterPriority: '' as Priority | '',
    setFilterPriority: vi.fn(),
    search: '',
    setSearch: vi.fn(),
    sortBy: 'createdAt' as 'createdAt' | 'priority' | 'status',
    setSortBy: vi.fn(),
    ...overrides,
  };
  const result = render(<FilterPanel {...props} />);
  return { ...result, props };
};

describe('FilterPanel - setFilterPriority callback', () => {
  it.each<Priority>(['critical', 'high', 'medium', 'low'])(
    'priority select 変更時に setFilterPriority が "%s" で呼ばれる',
    (priority) => {
      const setFilterPriority = vi.fn();
      const { unmount, container } = renderPanel({ setFilterPriority });
      try {
        const select = within(container).getByTestId('filter-priority');
        fireEvent.change(select, { target: { value: priority } });
        expect(setFilterPriority).toHaveBeenCalledTimes(1);
        expect(setFilterPriority).toHaveBeenCalledWith(priority);
      } finally {
        unmount();
      }
    }
  );

  it('priority select を "All priorities" に戻すと setFilterPriority("") が呼ばれる', () => {
    const setFilterPriority = vi.fn();
    const { unmount, container } = renderPanel({
      filterPriority: 'high',
      setFilterPriority,
    });
    try {
      const select = within(container).getByTestId('filter-priority');
      fireEvent.change(select, { target: { value: '' } });
      expect(setFilterPriority).toHaveBeenCalledWith('');
    } finally {
      unmount();
    }
  });

  it('priority select の value は props.filterPriority を反映する', () => {
    const { unmount, container } = renderPanel({ filterPriority: 'critical' });
    try {
      const select = within(container).getByTestId('filter-priority') as HTMLSelectElement;
      expect(select.value).toBe('critical');
    } finally {
      unmount();
    }
  });
});

describe('FilterPanel - setSortBy callback', () => {
  it.each<'createdAt' | 'priority' | 'status'>(['createdAt', 'priority', 'status'])(
    'sort-by select 変更時に setSortBy が "%s" で呼ばれる',
    (sortBy) => {
      const setSortBy = vi.fn();
      // start from a different value so onChange fires reliably
      const initial = sortBy === 'createdAt' ? 'priority' : 'createdAt';
      const { unmount, container } = renderPanel({ sortBy: initial, setSortBy });
      try {
        const select = within(container).getByTestId('sort-by');
        fireEvent.change(select, { target: { value: sortBy } });
        expect(setSortBy).toHaveBeenCalledTimes(1);
        expect(setSortBy).toHaveBeenCalledWith(sortBy);
      } finally {
        unmount();
      }
    }
  );

  it('sort-by select の value は props.sortBy を反映する', () => {
    const { unmount, container } = renderPanel({ sortBy: 'priority' });
    try {
      const select = within(container).getByTestId('sort-by') as HTMLSelectElement;
      expect(select.value).toBe('priority');
    } finally {
      unmount();
    }
  });

  it('sort-by select は 3 つのオプションを持つ', () => {
    const { unmount, container } = renderPanel();
    try {
      const select = within(container).getByTestId('sort-by') as HTMLSelectElement;
      expect(select.options.length).toBe(3);
      const values = Array.from(select.options).map(o => o.value);
      expect(values).toEqual(['createdAt', 'priority', 'status']);
    } finally {
      unmount();
    }
  });
});
