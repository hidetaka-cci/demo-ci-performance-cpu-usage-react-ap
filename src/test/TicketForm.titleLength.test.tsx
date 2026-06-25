/**
 * Unit tests for TicketForm's title-length validation branch.
 *
 * Covers TicketForm.tsx line 20: rejecting a trimmed title longer than 200
 * characters. The property-based suite exercises the "missing title" and
 * "missing description" branches but not the >200-char branch.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

function setField(q: ReturnType<typeof within>, testId: string, value: string) {
  fireEvent.change(q.getByTestId(testId), { target: { value } });
}

describe('TicketForm - title length validation', () => {
  it('shows the >200-char title error and does not call onSubmit when the trimmed title exceeds 200 characters', () => {
    const onSubmit = vi.fn();
    const { container } = render(<TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />);
    const q = within(container);

    setField(q, 'title-input', 'a'.repeat(201));
    setField(q, 'description-input', 'A valid description');
    fireEvent.click(q.getByTestId('submit-button'));

    expect(q.getByTestId('title-error').textContent).toBe('Title must be 200 characters or less');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('accepts a title of exactly 200 characters (boundary)', () => {
    const onSubmit = vi.fn();
    const { container } = render(<TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />);
    const q = within(container);

    const exactly200 = 'b'.repeat(200);
    setField(q, 'title-input', exactly200);
    setField(q, 'description-input', 'A valid description');
    fireEvent.click(q.getByTestId('submit-button'));

    expect(q.queryByTestId('title-error')).toBeNull();
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ title: exactly200 });
  });

  it('uses the trimmed length when checking the 200-char limit', () => {
    const onSubmit = vi.fn();
    const { container } = render(<TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />);
    const q = within(container);

    // Raw length is 204, but trimmed length is 200 — should be accepted.
    setField(q, 'title-input', '  ' + 'c'.repeat(200) + '  ');
    setField(q, 'description-input', 'A valid description');
    fireEvent.click(q.getByTestId('submit-button'));

    expect(q.queryByTestId('title-error')).toBeNull();
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0].title).toHaveLength(200);
  });
});
