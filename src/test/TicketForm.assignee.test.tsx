/**
 * Unit tests for TicketForm's assignee input.
 *
 * Covers the assignee onChange handler (TicketForm.tsx line 113) and
 * verifies that the submitted payload contains the trimmed assignee or
 * `undefined` when the field is left blank.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

function fillRequired(q: ReturnType<typeof within>) {
  fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Title' } });
  fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Description' } });
}

describe('TicketForm - assignee field', () => {
  it('updates the assignee input value when typed into', () => {
    const { container } = render(<TicketForm onSubmit={vi.fn()} onCancel={vi.fn()} />);
    const q = within(container);
    const assignee = q.getByTestId('assignee-input') as HTMLInputElement;

    fireEvent.change(assignee, { target: { value: 'Alice' } });

    expect(assignee.value).toBe('Alice');
  });

  it('submits the trimmed assignee in the payload', () => {
    const onSubmit = vi.fn();
    const { container } = render(<TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />);
    const q = within(container);

    fillRequired(q);
    fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '  Bob  ' } });
    fireEvent.click(q.getByTestId('submit-button'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ assignee: 'Bob' });
  });

  it('submits assignee as undefined when the field is blank', () => {
    const onSubmit = vi.fn();
    const { container } = render(<TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />);
    const q = within(container);

    fillRequired(q);
    fireEvent.click(q.getByTestId('submit-button'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
  });

  it('submits assignee as undefined when the field contains only whitespace', () => {
    const onSubmit = vi.fn();
    const { container } = render(<TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />);
    const q = within(container);

    fillRequired(q);
    fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '   ' } });
    fireEvent.click(q.getByTestId('submit-button'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
  });
});
