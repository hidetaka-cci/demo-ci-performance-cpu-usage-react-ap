/**
 * Interaction tests for FilterPanel component
 *
 * Complements FilterPanel.pbt.test.tsx by explicitly exercising the
 * setFilterPriority and setSortBy callback branches that were previously
 * uncovered.
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
  const utils = render(<FilterPanel {...props} />);
  return { ...utils, props };
}

describe('FilterPanel - setFilterPriority callback', () => {
  const priorities: Priority[] = ['low', 'medium', 'high', 'critical'];

  priorities.forEach((priority) => {
    it(`invokes setFilterPriority with "${priority}" when the priority select changes`, () => {
      const setFilterPriority = vi.fn();
      const { container } = renderPanel({ setFilterPriority });

      const select = within(container).getByTestId('filter-priority');
      fireEvent.change(select, { target: { value: priority } });

      expect(setFilterPriority).toHaveBeenCalledTimes(1);
      expect(setFilterPriority).toHaveBeenCalledWith(priority);
    });
  });

  it('invokes setFilterPriority with empty string when "All priorities" is selected', () => {
    const setFilterPriority = vi.fn();
    const { container } = renderPanel({ filterPriority: 'high', setFilterPriority });

    const select = within(container).getByTestId('filter-priority');
    fireEvent.change(select, { target: { value: '' } });

    expect(setFilterPriority).toHaveBeenCalledWith('');
  });

  it('does not invoke setFilterStatus when the priority select changes', () => {
    const setFilterStatus = vi.fn();
    const setFilterPriority = vi.fn();
    const { container } = renderPanel({ setFilterStatus, setFilterPriority });

    const select = within(container).getByTestId('filter-priority');
    fireEvent.change(select, { target: { value: 'low' } });

    expect(setFilterStatus).not.toHaveBeenCalled();
    expect(setFilterPriority).toHaveBeenCalledWith('low');
  });

  it('reflects the current filterPriority prop as the selected value', () => {
    const { container, unmount } = renderPanel({ filterPriority: 'critical' });
    const select = within(container).getByTestId('filter-priority') as HTMLSelectElement;
    expect(select.value).toBe('critical');
    unmount();
  });
});

describe('FilterPanel - setSortBy callback', () => {
  const sortValues: Array<'createdAt' | 'priority' | 'status'> = [
    'createdAt',
    'priority',
    'status',
  ];

  sortValues.forEach((value) => {
    it(`invokes setSortBy with "${value}" when the sort select changes`, () => {
      const setSortBy = vi.fn();
      // Start from a different initial value so the change actually fires
      const initial = value === 'createdAt' ? 'priority' : 'createdAt';
      const { container } = renderPanel({ sortBy: initial, setSortBy });

      const select = within(container).getByTestId('sort-by');
      fireEvent.change(select, { target: { value } });

      expect(setSortBy).toHaveBeenCalledTimes(1);
      expect(setSortBy).toHaveBeenCalledWith(value);
    });
  });

  it('reflects the current sortBy prop as the selected value', () => {
    const { container } = renderPanel({ sortBy: 'status' });
    const select = within(container).getByTestId('sort-by') as HTMLSelectElement;
    expect(select.value).toBe('status');
  });

  it('exposes exactly three sort options', () => {
    const { container } = renderPanel();
    const select = within(container).getByTestId('sort-by') as HTMLSelectElement;
    const values = Array.from(select.options).map((o) => o.value);
    expect(values).toEqual(['createdAt', 'priority', 'status']);
  });
});

describe('FilterPanel - status select edge cases', () => {
  it('invokes setFilterStatus with empty string when "All statuses" is selected', () => {
    const setFilterStatus = vi.fn();
    const { container } = renderPanel({ filterStatus: 'open', setFilterStatus });

    const select = within(container).getByTestId('filter-status');
    fireEvent.change(select, { target: { value: '' } });

    expect(setFilterStatus).toHaveBeenCalledWith('');
  });

  it('supports each concrete status value', () => {
    const statuses: Status[] = ['open', 'in_progress', 'resolved', 'closed'];
    statuses.forEach((status) => {
      const setFilterStatus = vi.fn();
      const { container, unmount } = renderPanel({ setFilterStatus });
      const select = within(container).getByTestId('filter-status');
      fireEvent.change(select, { target: { value: status } });
      expect(setFilterStatus).toHaveBeenCalledWith(status);
      unmount();
    });
  });
});
