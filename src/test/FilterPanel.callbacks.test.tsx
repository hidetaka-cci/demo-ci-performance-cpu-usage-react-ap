/**
 * Unit tests for FilterPanel callbacks that the PBT suite leaves uncovered.
 *
 * FilterPanel.pbt.test.tsx only verifies setSearch and setFilterStatus; the
 * priority select and sort select onChange handlers are uncovered without the
 * slow App integration suite. These tests pin them down directly.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { FilterPanel } from '../components/FilterPanel';
import type { Priority, Status } from '../types/ticket';

type SortBy = 'createdAt' | 'priority' | 'status';

function renderPanel(
  overrides: Partial<{
    filterStatus: Status | '';
    setFilterStatus: (v: Status | '') => void;
    filterPriority: Priority | '';
    setFilterPriority: (v: Priority | '') => void;
    search: string;
    setSearch: (v: string) => void;
    sortBy: SortBy;
    setSortBy: (v: SortBy) => void;
  }> = {}
) {
  const props = {
    filterStatus: '' as Status | '',
    setFilterStatus: vi.fn(),
    filterPriority: '' as Priority | '',
    setFilterPriority: vi.fn(),
    search: '',
    setSearch: vi.fn(),
    sortBy: 'createdAt' as SortBy,
    setSortBy: vi.fn(),
    ...overrides,
  };
  return { props, ...render(<FilterPanel {...props} />) };
}

describe('FilterPanel - priority callback', () => {
  it.each<Priority>(['critical', 'high', 'medium', 'low'])(
    'priority select 変更時に setFilterPriority(%s) が呼ばれる',
    (priority) => {
      const setFilterPriority = vi.fn();
      const { container, unmount } = renderPanel({ setFilterPriority });
      try {
        fireEvent.change(within(container).getByTestId('filter-priority'), {
          target: { value: priority },
        });
        expect(setFilterPriority).toHaveBeenCalledWith(priority);
      } finally {
        unmount();
      }
    }
  );

  it('priority select で空文字 ("All priorities") を選ぶと setFilterPriority("") が呼ばれる', () => {
    const setFilterPriority = vi.fn();
    const { container, unmount } = renderPanel({
      filterPriority: 'high',
      setFilterPriority,
    });
    try {
      fireEvent.change(within(container).getByTestId('filter-priority'), {
        target: { value: '' },
      });
      expect(setFilterPriority).toHaveBeenCalledWith('');
    } finally {
      unmount();
    }
  });
});

describe('FilterPanel - sortBy callback', () => {
  it.each<SortBy>(['priority', 'status', 'createdAt'])(
    'sort select 変更時に setSortBy(%s) が呼ばれる',
    (sortBy) => {
      const setSortBy = vi.fn();
      // 同じ値への変更はイベントが発火しないため、別の初期値を渡す
      const initial: SortBy = sortBy === 'createdAt' ? 'priority' : 'createdAt';
      const { container, unmount } = renderPanel({ sortBy: initial, setSortBy });
      try {
        fireEvent.change(within(container).getByTestId('sort-by'), {
          target: { value: sortBy },
        });
        expect(setSortBy).toHaveBeenCalledWith(sortBy);
      } finally {
        unmount();
      }
    }
  );
});

describe('FilterPanel - select reflects props', () => {
  it('filterPriority prop と sort prop が select の value に反映される', () => {
    const { container, unmount } = renderPanel({
      filterPriority: 'critical',
      sortBy: 'status',
    });
    try {
      const priority = within(container).getByTestId('filter-priority') as HTMLSelectElement;
      const sort = within(container).getByTestId('sort-by') as HTMLSelectElement;
      expect(priority.value).toBe('critical');
      expect(sort.value).toBe('status');
    } finally {
      unmount();
    }
  });

  it('sort-by select は3つのオプションを持つ', () => {
    const { container, unmount } = renderPanel();
    try {
      const sort = within(container).getByTestId('sort-by') as HTMLSelectElement;
      const values = Array.from(sort.options).map((o) => o.value);
      expect(values).toEqual(['createdAt', 'priority', 'status']);
    } finally {
      unmount();
    }
  });
});
