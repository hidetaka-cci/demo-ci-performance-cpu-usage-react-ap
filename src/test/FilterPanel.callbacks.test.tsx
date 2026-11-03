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

const defaultProps = {
  filterStatus: '' as Status | '',
  setFilterStatus: vi.fn(),
  filterPriority: '' as Priority | '',
  setFilterPriority: vi.fn(),
  search: '',
  setSearch: vi.fn(),
  sortBy: 'createdAt' as 'createdAt' | 'priority' | 'status',
  setSortBy: vi.fn(),
};

const NUM_RUNS = 100;

describe('FilterPanel - missing callback coverage', () => {
  it('priority select 変更時に setFilterPriority が正しい値で呼ばれる', () => {
    fc.assert(
      fc.property(priorityArb, (newPriority) => {
        const setFilterPriority = vi.fn();
        const { unmount, container } = render(
          <FilterPanel
            {...defaultProps}
            setFilterPriority={setFilterPriority}
          />
        );
        try {
          fireEvent.change(within(container).getByTestId('filter-priority'), {
            target: { value: newPriority },
          });
          expect(setFilterPriority).toHaveBeenCalledWith(newPriority);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('sort-by select 変更時に setSortBy が正しい値で呼ばれる', () => {
    fc.assert(
      fc.property(sortByArb, (newSortBy) => {
        const setSortBy = vi.fn();
        const { unmount, container } = render(
          <FilterPanel
            {...defaultProps}
            setSortBy={setSortBy}
          />
        );
        try {
          fireEvent.change(within(container).getByTestId('sort-by'), {
            target: { value: newSortBy },
          });
          expect(setSortBy).toHaveBeenCalledWith(newSortBy);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('priority select を空にリセットすると setFilterPriority が空文字で呼ばれる', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const setFilterPriority = vi.fn();
        const { unmount, container } = render(
          <FilterPanel
            {...defaultProps}
            filterPriority="high"
            setFilterPriority={setFilterPriority}
          />
        );
        try {
          fireEvent.change(within(container).getByTestId('filter-priority'), {
            target: { value: '' },
          });
          expect(setFilterPriority).toHaveBeenCalledWith('');
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('sort-by select の value は props.sortBy と一致する', () => {
    fc.assert(
      fc.property(sortByArb, (sortBy) => {
        const { unmount, container } = render(
          <FilterPanel {...defaultProps} sortBy={sortBy} />
        );
        try {
          const select = within(container).getByTestId('sort-by') as HTMLSelectElement;
          expect(select.value).toBe(sortBy);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });
});
