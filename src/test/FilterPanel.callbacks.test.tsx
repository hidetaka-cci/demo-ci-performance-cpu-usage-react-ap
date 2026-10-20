/**
 * Callback tests for FilterPanel interactions not covered by the PBT suite.
 *
 * The existing PBT file tests setSearch and setFilterStatus callbacks.
 * This file adds coverage for setFilterPriority and setSortBy,
 * which are the only two untested callback paths in FilterPanel.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, within } from '@testing-library/react';
import { FilterPanel } from '../components/FilterPanel';

const defaultProps = {
  filterStatus: '' as const,
  setFilterStatus: vi.fn(),
  filterPriority: '' as const,
  setFilterPriority: vi.fn(),
  search: '',
  setSearch: vi.fn(),
  sortBy: 'createdAt' as const,
  setSortBy: vi.fn(),
};

function renderPanel(overrides: Partial<typeof defaultProps> = {}) {
  const props = { ...defaultProps, ...overrides };
  // refresh mocks each render so tests are independent
  const setFilterPriority = vi.fn();
  const setSortBy = vi.fn();
  const mergedProps = { ...props, setFilterPriority, setSortBy, ...overrides };
  const result = render(<FilterPanel {...mergedProps} />);
  return { ...result, q: within(result.container), setFilterPriority, setSortBy };
}

describe('FilterPanel - priority filter callback', () => {
  it('changing priority select calls setFilterPriority with "critical"', () => {
    const { q, setFilterPriority } = renderPanel();
    fireEvent.change(q.getByTestId('filter-priority'), { target: { value: 'critical' } });
    expect(setFilterPriority).toHaveBeenCalledWith('critical');
  });

  it('changing priority select calls setFilterPriority with "high"', () => {
    const { q, setFilterPriority } = renderPanel();
    fireEvent.change(q.getByTestId('filter-priority'), { target: { value: 'high' } });
    expect(setFilterPriority).toHaveBeenCalledWith('high');
  });

  it('changing priority select calls setFilterPriority with "medium"', () => {
    const { q, setFilterPriority } = renderPanel();
    fireEvent.change(q.getByTestId('filter-priority'), { target: { value: 'medium' } });
    expect(setFilterPriority).toHaveBeenCalledWith('medium');
  });

  it('changing priority select calls setFilterPriority with "low"', () => {
    const { q, setFilterPriority } = renderPanel();
    fireEvent.change(q.getByTestId('filter-priority'), { target: { value: 'low' } });
    expect(setFilterPriority).toHaveBeenCalledWith('low');
  });

  it('resetting priority select to "" calls setFilterPriority with ""', () => {
    const { q, setFilterPriority } = renderPanel({ filterPriority: 'high' });
    fireEvent.change(q.getByTestId('filter-priority'), { target: { value: '' } });
    expect(setFilterPriority).toHaveBeenCalledWith('');
  });
});

describe('FilterPanel - sort-by callback', () => {
  it('changing sort select calls setSortBy with "priority"', () => {
    const { q, setSortBy } = renderPanel();
    fireEvent.change(q.getByTestId('sort-by'), { target: { value: 'priority' } });
    expect(setSortBy).toHaveBeenCalledWith('priority');
  });

  it('changing sort select calls setSortBy with "status"', () => {
    const { q, setSortBy } = renderPanel();
    fireEvent.change(q.getByTestId('sort-by'), { target: { value: 'status' } });
    expect(setSortBy).toHaveBeenCalledWith('status');
  });

  it('changing sort select calls setSortBy with "createdAt"', () => {
    const { q, setSortBy } = renderPanel({ sortBy: 'priority' });
    fireEvent.change(q.getByTestId('sort-by'), { target: { value: 'createdAt' } });
    expect(setSortBy).toHaveBeenCalledWith('createdAt');
  });

  it('sort-by select has three options', () => {
    const { q } = renderPanel();
    const select = q.getByTestId('sort-by') as HTMLSelectElement;
    expect(select.options.length).toBe(3);
    const values = Array.from(select.options).map(o => o.value);
    expect(values).toContain('createdAt');
    expect(values).toContain('priority');
    expect(values).toContain('status');
  });
});
