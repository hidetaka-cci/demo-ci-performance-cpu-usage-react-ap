/**
 * Tests for TicketForm's assignee field and title length validation.
 *
 * Covers previously uncovered lines/branches:
 *   - TicketForm.tsx line 113: onChange handler for assignee input
 *   - TicketForm.tsx line 20:  title > 200 chars validation branch
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

describe('TicketForm - assignee field', () => {
  it('assignee input reflects typed value', () => {
    const { container } = render(<TicketForm onSubmit={vi.fn()} onCancel={vi.fn()} />);
    const input = within(container).getByTestId('assignee-input') as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'Alice' } });

    expect(input.value).toBe('Alice');
  });

  it('assignee value is included in submission when non-empty', () => {
    const onSubmit = vi.fn();
    const { container } = render(<TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />);
    const q = within(container);

    fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Fix login bug' } });
    fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Server returns 500' } });
    fireEvent.change(q.getByTestId('assignee-input'), { target: { value: 'Bob' } });
    fireEvent.click(q.getByTestId('submit-button'));

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit.mock.calls[0][0].assignee).toBe('Bob');
  });

  it('whitespace-only assignee is omitted from submission', () => {
    const onSubmit = vi.fn();
    const { container } = render(<TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />);
    const q = within(container);

    fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Some title' } });
    fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Some description' } });
    fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '   ' } });
    fireEvent.click(q.getByTestId('submit-button'));

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
  });
});

describe('TicketForm - title length validation', () => {
  it('title with exactly 200 characters is accepted', () => {
    const onSubmit = vi.fn();
    const { container } = render(<TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />);
    const q = within(container);

    fireEvent.change(q.getByTestId('title-input'), { target: { value: 'a'.repeat(200) } });
    fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Valid description' } });
    fireEvent.click(q.getByTestId('submit-button'));

    expect(q.queryByTestId('title-error')).not.toBeInTheDocument();
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('title with 201+ characters shows validation error and blocks submission', () => {
    const onSubmit = vi.fn();
    const { container } = render(<TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />);
    const q = within(container);

    fireEvent.change(q.getByTestId('title-input'), { target: { value: 'a'.repeat(201) } });
    fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Valid description' } });
    fireEvent.click(q.getByTestId('submit-button'));

    expect(q.getByTestId('title-error')).toBeInTheDocument();
    expect(q.getByTestId('title-error').textContent).toBe('Title must be 200 characters or less');
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
