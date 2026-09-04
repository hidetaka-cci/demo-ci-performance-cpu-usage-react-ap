/**
 * Unit tests for TicketForm's assignee field.
 *
 * Covers TicketForm.tsx line 113 (`onChange={e => setAssignee(...)}`)
 * and the round-trip through validate + submit so the field's
 * trim + optional handling is exercised.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

describe('TicketForm - assignee field', () => {
  it('updates the assignee input value when the user types', () => {
    const { container } = render(
      <TicketForm onSubmit={vi.fn()} onCancel={vi.fn()} />
    );

    const input = within(container).getByTestId('assignee-input') as HTMLInputElement;
    expect(input.value).toBe('');

    fireEvent.change(input, { target: { value: 'Alice' } });

    expect(input.value).toBe('Alice');
  });

  it('forwards the trimmed assignee value on submit', () => {
    const onSubmit = vi.fn();
    const { container } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );

    const q = within(container);
    fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Bug' } });
    fireEvent.change(q.getByTestId('description-input'), { target: { value: 'A description' } });
    fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '  Bob  ' } });
    fireEvent.click(q.getByTestId('submit-button'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0].assignee).toBe('Bob');
  });

  it('submits undefined when the assignee field is left blank', () => {
    const onSubmit = vi.fn();
    const { container } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );

    const q = within(container);
    fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Bug' } });
    fireEvent.change(q.getByTestId('description-input'), { target: { value: 'A description' } });
    fireEvent.click(q.getByTestId('submit-button'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
  });

  it('submits undefined when the assignee field is whitespace-only', () => {
    const onSubmit = vi.fn();
    const { container } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );

    const q = within(container);
    fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Bug' } });
    fireEvent.change(q.getByTestId('description-input'), { target: { value: 'A description' } });
    fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '   ' } });
    fireEvent.click(q.getByTestId('submit-button'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
  });

  it('does not call onSubmit when the title is missing even if assignee is set', () => {
    const onSubmit = vi.fn();
    const { container } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );

    const q = within(container);
    fireEvent.change(q.getByTestId('description-input'), { target: { value: 'desc' } });
    fireEvent.change(q.getByTestId('assignee-input'), { target: { value: 'Alice' } });
    fireEvent.click(q.getByTestId('submit-button'));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(q.getByTestId('title-error')).toBeInTheDocument();
  });
});
