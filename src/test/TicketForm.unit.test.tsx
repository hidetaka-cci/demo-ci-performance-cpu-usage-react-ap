import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

describe('TicketForm - assignee field', () => {
  it('typing in assignee input updates its displayed value', () => {
    const { container } = render(<TicketForm onSubmit={vi.fn()} onCancel={vi.fn()} />);
    const q = within(container);
    const input = q.getByTestId('assignee-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Alice' } });
    expect(input.value).toBe('Alice');
  });

  it('submitting with an assignee passes it to onSubmit', () => {
    const onSubmit = vi.fn();
    const { container } = render(<TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />);
    const q = within(container);
    fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Fix the bug' } });
    fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Steps to reproduce...' } });
    fireEvent.change(q.getByTestId('assignee-input'), { target: { value: 'Bob' } });
    fireEvent.click(q.getByTestId('submit-button'));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ assignee: 'Bob' })
    );
  });

  it('submitting with an empty assignee passes undefined to onSubmit', () => {
    const onSubmit = vi.fn();
    const { container } = render(<TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />);
    const q = within(container);
    fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Fix the bug' } });
    fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Steps to reproduce...' } });
    fireEvent.click(q.getByTestId('submit-button'));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ assignee: undefined })
    );
  });
});

describe('TicketForm - title length validation', () => {
  it('title exactly 200 characters is accepted', () => {
    const onSubmit = vi.fn();
    const { container } = render(<TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />);
    const q = within(container);
    fireEvent.change(q.getByTestId('title-input'), { target: { value: 'a'.repeat(200) } });
    fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Some description' } });
    fireEvent.click(q.getByTestId('submit-button'));
    expect(q.queryByTestId('title-error')).not.toBeInTheDocument();
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('title over 200 characters shows error and blocks submission', () => {
    const onSubmit = vi.fn();
    const { container } = render(<TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />);
    const q = within(container);
    fireEvent.change(q.getByTestId('title-input'), { target: { value: 'a'.repeat(201) } });
    fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Some description' } });
    fireEvent.click(q.getByTestId('submit-button'));
    const err = q.getByTestId('title-error');
    expect(err).toBeInTheDocument();
    expect(err.textContent).toBe('Title must be 200 characters or less');
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
