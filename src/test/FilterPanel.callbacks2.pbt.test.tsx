/**
 * Property-Based Tests for FilterPanel - missing callback coverage
 *
 * The existing FilterPanel.pbt.test.tsx covers setSearch and setFilterStatus.
 * This file covers setFilterPriority and setSortBy, which were previously untested.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import { FilterPanel } from '../components/FilterPanel';
import type { Status, Priority } from '../types/ticket';

const statusArb = fc.constantFrom<Status>('open', 'in_progress', 'resolved', 'closed');
const priorityArb = fc.constantFrom<Priority>('low', 'medium', 'high', 'critical');
const sortByArb = fc.constantFrom<'createdAt' | 'priority' | 'status'>(
  'createdAt',
  'priority',
  'status'
);

const filterStateArb = fc.record({
  filterStatus: fc.oneof(fc.constant<Status | ''>(''), statusArb),
  filterPriority: fc.oneof(fc.constant<Priority | ''>(''), priorityArb),
  search: fc.string({ maxLength: 50 }),
  sortBy: sortByArb,
});

const NUM_RUNS = 200;

describe('FilterPanel - priority and sort callback properties', () => {
  it('priority select 変更時に setFilterPriority が正しい値で呼ばれる', () => {
    fc.assert(
      fc.property(filterStateArb, priorityArb, (state, newPriority) => {
        const setFilterPriority = vi.fn();
        const { unmount, container } = render(
          <FilterPanel
            filterStatus={state.filterStatus}
            setFilterStatus={vi.fn()}
            filterPriority={state.filterPriority}
            setFilterPriority={setFilterPriority}
            search={state.search}
            setSearch={vi.fn()}
            sortBy={state.sortBy}
            setSortBy={vi.fn()}
          />
        );
        try {
          const select = within(container).getByTestId('filter-priority');
          fireEvent.change(select, { target: { value: newPriority } });
          expect(setFilterPriority).toHaveBeenCalledWith(newPriority);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('priority select を空にすると setFilterPriority が空文字で呼ばれる', () => {
    fc.assert(
      fc.property(filterStateArb, (state) => {
        const setFilterPriority = vi.fn();
        const { unmount, container } = render(
          <FilterPanel
            filterStatus={state.filterStatus}
            setFilterStatus={vi.fn()}
            filterPriority={state.filterPriority}
            setFilterPriority={setFilterPriority}
            search={state.search}
            setSearch={vi.fn()}
            sortBy={state.sortBy}
            setSortBy={vi.fn()}
          />
        );
        try {
          const select = within(container).getByTestId('filter-priority');
          fireEvent.change(select, { target: { value: '' } });
          expect(setFilterPriority).toHaveBeenCalledWith('');
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('sort select 変更時に setSortBy が正しい値で呼ばれる', () => {
    fc.assert(
      fc.property(filterStateArb, sortByArb, (state, newSortBy) => {
        const setSortBy = vi.fn();
        const { unmount, container } = render(
          <FilterPanel
            filterStatus={state.filterStatus}
            setFilterStatus={vi.fn()}
            filterPriority={state.filterPriority}
            setFilterPriority={vi.fn()}
            search={state.search}
            setSearch={vi.fn()}
            sortBy={state.sortBy}
            setSortBy={setSortBy}
          />
        );
        try {
          const select = within(container).getByTestId('sort-by');
          fireEvent.change(select, { target: { value: newSortBy } });
          expect(setSortBy).toHaveBeenCalledWith(newSortBy);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('sort select は常に3つのオプションを持つ', () => {
    fc.assert(
      fc.property(filterStateArb, (state) => {
        const { unmount, container } = render(
          <FilterPanel
            filterStatus={state.filterStatus}
            setFilterStatus={vi.fn()}
            filterPriority={state.filterPriority}
            setFilterPriority={vi.fn()}
            search={state.search}
            setSearch={vi.fn()}
            sortBy={state.sortBy}
            setSortBy={vi.fn()}
          />
        );
        try {
          const select = within(container).getByTestId('sort-by') as HTMLSelectElement;
          expect(select.options.length).toBe(3);
          const values = Array.from(select.options).map(o => o.value);
          expect(values).toContain('createdAt');
          expect(values).toContain('priority');
          expect(values).toContain('status');
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });
});
