import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
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

describe('FilterPanel - setSortBy callback', () => {
  it('calls setSortBy with "priority" when sort-by select changes to priority', () => {
    const setSortBy = vi.fn();
    const { container } = render(<FilterPanel {...defaultProps} setSortBy={setSortBy} />);
    fireEvent.change(within(container).getByTestId('sort-by'), { target: { value: 'priority' } });
    expect(setSortBy).toHaveBeenCalledOnce();
    expect(setSortBy).toHaveBeenCalledWith('priority');
  });

  it('calls setSortBy with "status" when sort-by select changes to status', () => {
    const setSortBy = vi.fn();
    const { container } = render(<FilterPanel {...defaultProps} setSortBy={setSortBy} />);
    fireEvent.change(within(container).getByTestId('sort-by'), { target: { value: 'status' } });
    expect(setSortBy).toHaveBeenCalledWith('status');
  });

  it('calls setSortBy with "createdAt" when sort-by select changes to createdAt', () => {
    const setSortBy = vi.fn();
    const { container } = render(
      <FilterPanel {...defaultProps} sortBy="priority" setSortBy={setSortBy} />
    );
    fireEvent.change(within(container).getByTestId('sort-by'), { target: { value: 'createdAt' } });
    expect(setSortBy).toHaveBeenCalledWith('createdAt');
  });

  it('sort-by select reflects current sortBy prop', () => {
    const { container } = render(<FilterPanel {...defaultProps} sortBy="status" />);
    const select = within(container).getByTestId('sort-by') as HTMLSelectElement;
    expect(select.value).toBe('status');
  });
});

describe('FilterPanel - setFilterPriority callback', () => {
  it('calls setFilterPriority with "critical" when priority select changes', () => {
    const setFilterPriority = vi.fn();
    const { container } = render(
      <FilterPanel {...defaultProps} setFilterPriority={setFilterPriority} />
    );
    fireEvent.change(within(container).getByTestId('filter-priority'), {
      target: { value: 'critical' },
    });
    expect(setFilterPriority).toHaveBeenCalledOnce();
    expect(setFilterPriority).toHaveBeenCalledWith('critical');
  });

  it('calls setFilterPriority with "high" when priority select changes to high', () => {
    const setFilterPriority = vi.fn();
    const { container } = render(
      <FilterPanel {...defaultProps} setFilterPriority={setFilterPriority} />
    );
    fireEvent.change(within(container).getByTestId('filter-priority'), {
      target: { value: 'high' },
    });
    expect(setFilterPriority).toHaveBeenCalledWith('high');
  });

  it('calls setFilterPriority with "medium" when priority select changes to medium', () => {
    const setFilterPriority = vi.fn();
    const { container } = render(
      <FilterPanel {...defaultProps} setFilterPriority={setFilterPriority} />
    );
    fireEvent.change(within(container).getByTestId('filter-priority'), {
      target: { value: 'medium' },
    });
    expect(setFilterPriority).toHaveBeenCalledWith('medium');
  });

  it('calls setFilterPriority with "low" when priority select changes to low', () => {
    const setFilterPriority = vi.fn();
    const { container } = render(
      <FilterPanel {...defaultProps} setFilterPriority={setFilterPriority} />
    );
    fireEvent.change(within(container).getByTestId('filter-priority'), {
      target: { value: 'low' },
    });
    expect(setFilterPriority).toHaveBeenCalledWith('low');
  });

  it('calls setFilterPriority with "" to reset priority filter', () => {
    const setFilterPriority = vi.fn();
    const { container } = render(
      <FilterPanel {...defaultProps} filterPriority="high" setFilterPriority={setFilterPriority} />
    );
    fireEvent.change(within(container).getByTestId('filter-priority'), {
      target: { value: '' },
    });
    expect(setFilterPriority).toHaveBeenCalledWith('');
  });

  it('filter-priority select reflects current filterPriority prop', () => {
    const { container } = render(
      <FilterPanel {...defaultProps} filterPriority="critical" />
    );
    const select = within(container).getByTestId('filter-priority') as HTMLSelectElement;
    expect(select.value).toBe('critical');
  });
});

describe('FilterPanel - sort-by options', () => {
  it('sort-by select has 3 options', () => {
    const { container } = render(<FilterPanel {...defaultProps} />);
    const select = within(container).getByTestId('sort-by') as HTMLSelectElement;
    expect(select.options).toHaveLength(3);
  });

  it('sort-by select options include createdAt, priority, status', () => {
    const { container } = render(<FilterPanel {...defaultProps} />);
    const select = within(container).getByTestId('sort-by') as HTMLSelectElement;
    const values = Array.from(select.options).map(o => o.value);
    expect(values).toContain('createdAt');
    expect(values).toContain('priority');
    expect(values).toContain('status');
  });
});
