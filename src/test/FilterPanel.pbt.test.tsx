/**
 * Property-Based Tests for FilterPanel component
 *
 * App.tsx から抽出したフィルタ・検索・ソートUIのコンポーネントテスト。
 * filter state の任意の組み合わせでクラッシュしないことと、
 * コールバックが正しい値で呼ばれることを検証します。
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import { FilterPanel } from '../components/FilterPanel';
import type { Status, Priority } from '../types/ticket';

// ── Arbitraries ────────────────────────────────────────────────────────────────

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

// ── numRuns ────────────────────────────────────────────────────────────────────
const NUM_RUNS = 500;

// ── Properties ────────────────────────────────────────────────────────────────

describe('FilterPanel - rendering properties', () => {
  it('任意のフィルタ状態でクラッシュしない', () => {
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
          expect(within(container).getByTestId('filter-panel')).toBeInTheDocument();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('search input は常にレンダリングされる', () => {
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
          expect(within(container).getByTestId('search-input')).toBeInTheDocument();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('filter-status select は常に5つのオプションを持つ', () => {
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
          const select = within(container).getByTestId('filter-status') as HTMLSelectElement;
          // "All statuses" + 4 statuses
          expect(select.options.length).toBe(5);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('filter-priority select は常に5つのオプションを持つ', () => {
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
          const select = within(container).getByTestId('filter-priority') as HTMLSelectElement;
          // "All priorities" + 4 priorities
          expect(select.options.length).toBe(5);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('search input の value は props.search と一致する', () => {
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
          const input = within(container).getByTestId('search-input') as HTMLInputElement;
          expect(input.value).toBe(state.search);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });
});

describe('FilterPanel - callback properties', () => {
  it('search input 変更時に setSearch が呼ばれる', () => {
    fc.assert(
      fc.property(
        filterStateArb,
        // 空文字は React が同値と判断してイベントを発火しないケースがあるため 1 文字以上
        fc.string({ minLength: 1, maxLength: 50 }),
        (state, newValue) => {
          // React's controlled input doesn't fire onChange if the value doesn't actually change
          // Skip this test case if the current search is the same as newValue
          fc.pre(state.search !== newValue);

          const setSearch = vi.fn();
          const { unmount, container } = render(
            <FilterPanel
              filterStatus={state.filterStatus}
              setFilterStatus={vi.fn()}
              filterPriority={state.filterPriority}
              setFilterPriority={vi.fn()}
              search={state.search}
              setSearch={setSearch}
              sortBy={state.sortBy}
              setSortBy={vi.fn()}
            />
          );
          try {
            const input = within(container).getByTestId('search-input') as HTMLInputElement;

            fireEvent.change(input, { target: { value: newValue } });
            // onChange should be called when value actually changes
            expect(setSearch).toHaveBeenCalledWith(newValue);
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: NUM_RUNS }
    );
  });

  it('status select 変更時に setFilterStatus が呼ばれる', () => {
    fc.assert(
      fc.property(filterStateArb, statusArb, (state, newStatus) => {
        const setFilterStatus = vi.fn();
        const { unmount, container } = render(
          <FilterPanel
            filterStatus={state.filterStatus}
            setFilterStatus={setFilterStatus}
            filterPriority={state.filterPriority}
            setFilterPriority={vi.fn()}
            search={state.search}
            setSearch={vi.fn()}
            sortBy={state.sortBy}
            setSortBy={vi.fn()}
          />
        );
        try {
          const select = within(container).getByTestId('filter-status');
          fireEvent.change(select, { target: { value: newStatus } });
          expect(setFilterStatus).toHaveBeenCalledWith(newStatus);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });
});
