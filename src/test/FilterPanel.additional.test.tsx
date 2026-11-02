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

describe('FilterPanel - priority and sortBy callbacks', () => {
  it('priority フィルタ変更時に setFilterPriority が新しい値で呼ばれる', () => {
    const setFilterPriority = vi.fn();
    const { unmount, container } = render(
      <FilterPanel {...defaultProps} setFilterPriority={setFilterPriority} />
    );
    try {
      fireEvent.change(within(container).getByTestId('filter-priority'), {
        target: { value: 'high' },
      });
      expect(setFilterPriority).toHaveBeenCalledOnce();
      expect(setFilterPriority).toHaveBeenCalledWith('high');
    } finally {
      unmount();
    }
  });

  it.each(['critical', 'high', 'medium', 'low'] as Priority[])(
    'priority=%s を選択すると setFilterPriority が呼ばれる',
    (priority) => {
      const setFilterPriority = vi.fn();
      const { unmount, container } = render(
        <FilterPanel {...defaultProps} setFilterPriority={setFilterPriority} />
      );
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

  it('sort-by 変更時に setSortBy が新しい値で呼ばれる', () => {
    const setSortBy = vi.fn();
    const { unmount, container } = render(
      <FilterPanel {...defaultProps} setSortBy={setSortBy} />
    );
    try {
      fireEvent.change(within(container).getByTestId('sort-by'), {
        target: { value: 'priority' },
      });
      expect(setSortBy).toHaveBeenCalledOnce();
      expect(setSortBy).toHaveBeenCalledWith('priority');
    } finally {
      unmount();
    }
  });

  it.each(['createdAt', 'priority', 'status'] as const)(
    'sortBy=%s を選択すると setSortBy が呼ばれる',
    (sortBy) => {
      const setSortBy = vi.fn();
      const { unmount, container } = render(
        <FilterPanel {...defaultProps} setSortBy={setSortBy} />
      );
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

  it('sort-by select は 3 つのオプションを持つ', () => {
    const { unmount, container } = render(<FilterPanel {...defaultProps} />);
    try {
      const select = within(container).getByTestId('sort-by') as HTMLSelectElement;
      expect(select.options.length).toBe(3);
      const values = Array.from(select.options).map((o) => o.value);
      expect(values).toContain('createdAt');
      expect(values).toContain('priority');
      expect(values).toContain('status');
    } finally {
      unmount();
    }
  });
});
