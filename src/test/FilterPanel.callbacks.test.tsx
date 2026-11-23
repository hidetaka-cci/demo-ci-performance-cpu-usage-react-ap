import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, within } from '@testing-library/react';
import { FilterPanel } from '../components/FilterPanel';

// Covers the setFilterPriority and setSortBy callbacks that are absent from the
// existing PBT suite (FilterPanel.pbt.test.tsx only tests setSearch and setFilterStatus).

const baseProps = {
  filterStatus: '' as const,
  setFilterStatus: vi.fn(),
  filterPriority: '' as const,
  setFilterPriority: vi.fn(),
  search: '',
  setSearch: vi.fn(),
  sortBy: 'createdAt' as const,
  setSortBy: vi.fn(),
};

describe('FilterPanel - setFilterPriority callback', () => {
  it('calls setFilterPriority with "critical" when that option is selected', () => {
    const setFilterPriority = vi.fn();
    const { container, unmount } = render(
      <FilterPanel {...baseProps} setFilterPriority={setFilterPriority} />
    );
    try {
      fireEvent.change(within(container).getByTestId('filter-priority'), {
        target: { value: 'critical' },
      });
      expect(setFilterPriority).toHaveBeenCalledWith('critical');
    } finally {
      unmount();
    }
  });

  it('calls setFilterPriority with "high" when that option is selected', () => {
    const setFilterPriority = vi.fn();
    const { container, unmount } = render(
      <FilterPanel {...baseProps} setFilterPriority={setFilterPriority} />
    );
    try {
      fireEvent.change(within(container).getByTestId('filter-priority'), {
        target: { value: 'high' },
      });
      expect(setFilterPriority).toHaveBeenCalledWith('high');
    } finally {
      unmount();
    }
  });

  it('calls setFilterPriority with "medium" when that option is selected', () => {
    const setFilterPriority = vi.fn();
    const { container, unmount } = render(
      <FilterPanel {...baseProps} setFilterPriority={setFilterPriority} />
    );
    try {
      fireEvent.change(within(container).getByTestId('filter-priority'), {
        target: { value: 'medium' },
      });
      expect(setFilterPriority).toHaveBeenCalledWith('medium');
    } finally {
      unmount();
    }
  });

  it('calls setFilterPriority with "low" when that option is selected', () => {
    const setFilterPriority = vi.fn();
    const { container, unmount } = render(
      <FilterPanel {...baseProps} setFilterPriority={setFilterPriority} />
    );
    try {
      fireEvent.change(within(container).getByTestId('filter-priority'), {
        target: { value: 'low' },
      });
      expect(setFilterPriority).toHaveBeenCalledWith('low');
    } finally {
      unmount();
    }
  });

  it('calls setFilterPriority with empty string to reset the filter', () => {
    const setFilterPriority = vi.fn();
    const { container, unmount } = render(
      <FilterPanel
        {...baseProps}
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
  });
});

describe('FilterPanel - setSortBy callback', () => {
  it('calls setSortBy with "priority" when that sort option is selected', () => {
    const setSortBy = vi.fn();
    const { container, unmount } = render(
      <FilterPanel {...baseProps} setSortBy={setSortBy} />
    );
    try {
      fireEvent.change(within(container).getByTestId('sort-by'), {
        target: { value: 'priority' },
      });
      expect(setSortBy).toHaveBeenCalledWith('priority');
    } finally {
      unmount();
    }
  });

  it('calls setSortBy with "status" when that sort option is selected', () => {
    const setSortBy = vi.fn();
    const { container, unmount } = render(
      <FilterPanel {...baseProps} setSortBy={setSortBy} />
    );
    try {
      fireEvent.change(within(container).getByTestId('sort-by'), {
        target: { value: 'status' },
      });
      expect(setSortBy).toHaveBeenCalledWith('status');
    } finally {
      unmount();
    }
  });

  it('calls setSortBy with "createdAt" when switching back to newest-first', () => {
    const setSortBy = vi.fn();
    const { container, unmount } = render(
      <FilterPanel {...baseProps} sortBy="priority" setSortBy={setSortBy} />
    );
    try {
      fireEvent.change(within(container).getByTestId('sort-by'), {
        target: { value: 'createdAt' },
      });
      expect(setSortBy).toHaveBeenCalledWith('createdAt');
    } finally {
      unmount();
    }
  });
});
