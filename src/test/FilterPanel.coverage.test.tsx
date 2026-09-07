/**
 * Coverage tests for FilterPanel callbacks that are not exercised by the
 * existing PBT suite:
 *   - filter-priority `onChange` (lines around FilterPanel.tsx:60)
 *   - sort-by `onChange`         (lines around FilterPanel.tsx:72)
 *
 * The PBT file only fires change events on the search input and the status
 * select, so the two select handlers below have no callers in tests.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { FilterPanel } from '../components/FilterPanel';
import type { Priority, Status } from '../types/ticket';

function renderPanel(overrides: Partial<React.ComponentProps<typeof FilterPanel>> = {}) {
  const props: React.ComponentProps<typeof FilterPanel> = {
    filterStatus: '',
    setFilterStatus: vi.fn(),
    filterPriority: '',
    setFilterPriority: vi.fn(),
    search: '',
    setSearch: vi.fn(),
    sortBy: 'createdAt',
    setSortBy: vi.fn(),
    ...overrides,
  };
  const result = render(<FilterPanel {...props} />);
  return { ...result, q: within(result.container), props };
}

describe('FilterPanel - priority select callback', () => {
  const priorityValues: Array<Priority | ''> = ['', 'low', 'medium', 'high', 'critical'];

  it.each(priorityValues)('setFilterPriority is called with %s when the priority select changes', (value) => {
    const setFilterPriority = vi.fn();
    const { unmount, q } = renderPanel({ setFilterPriority });
    try {
      const select = q.getByTestId('filter-priority');
      fireEvent.change(select, { target: { value } });
      expect(setFilterPriority).toHaveBeenCalledTimes(1);
      expect(setFilterPriority).toHaveBeenCalledWith(value);
    } finally {
      unmount();
    }
  });

  it('renders the currently selected priority option', () => {
    const { unmount, q } = renderPanel({ filterPriority: 'high' });
    try {
      const select = q.getByTestId('filter-priority') as HTMLSelectElement;
      expect(select.value).toBe('high');
    } finally {
      unmount();
    }
  });
});

describe('FilterPanel - sort-by callback', () => {
  const sortValues: Array<'createdAt' | 'priority' | 'status'> = ['createdAt', 'priority', 'status'];

  it.each(sortValues)('setSortBy is called with %s when the sort-by select changes', (value) => {
    const setSortBy = vi.fn();
    // Start on a different value so React actually fires the change event.
    const initial = value === 'createdAt' ? 'priority' : 'createdAt';
    const { unmount, q } = renderPanel({ sortBy: initial, setSortBy });
    try {
      const select = q.getByTestId('sort-by');
      fireEvent.change(select, { target: { value } });
      expect(setSortBy).toHaveBeenCalledTimes(1);
      expect(setSortBy).toHaveBeenCalledWith(value);
    } finally {
      unmount();
    }
  });

  it('renders exactly three sort options', () => {
    const { unmount, q } = renderPanel();
    try {
      const select = q.getByTestId('sort-by') as HTMLSelectElement;
      const optionValues = Array.from(select.options).map(o => o.value);
      expect(optionValues).toEqual(['createdAt', 'priority', 'status']);
    } finally {
      unmount();
    }
  });
});

describe('FilterPanel - status select callback (edge cases)', () => {
  it('setFilterStatus is called with an empty string when "All statuses" is selected', () => {
    // Complements the PBT test which only fires non-empty status values.
    const setFilterStatus = vi.fn();
    const { unmount, q } = renderPanel({ filterStatus: 'open' as Status, setFilterStatus });
    try {
      const select = q.getByTestId('filter-status');
      fireEvent.change(select, { target: { value: '' } });
      expect(setFilterStatus).toHaveBeenCalledWith('');
    } finally {
      unmount();
    }
  });
});
