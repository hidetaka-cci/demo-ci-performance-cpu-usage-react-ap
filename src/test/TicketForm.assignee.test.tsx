/**
 * Focused tests for TicketForm's assignee input.
 *
 * Covers the previously untested onChange handler on line 113 of TicketForm.tsx:
 *   onChange={e => setAssignee(e.target.value)}
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';
import type { TicketFormData } from '../types/ticket';

describe('TicketForm - assignee input', () => {
  it('typing into the assignee input updates the visible value', () => {
    const { container } = render(
      <TicketForm onSubmit={vi.fn()} onCancel={vi.fn()} />
    );

    const assignee = within(container).getByTestId('assignee-input') as HTMLInputElement;
    expect(assignee.value).toBe('');

    fireEvent.change(assignee, { target: { value: 'Alice' } });
    expect(assignee.value).toBe('Alice');
  });

  it('submitting with an assignee includes the trimmed value in the payload', () => {
    const onSubmit = vi.fn<(data: TicketFormData) => void>();
    const { container } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    const q = within(container);

    fireEvent.change(q.getByTestId('title-input'), { target: { value: 'A title' } });
    fireEvent.change(q.getByTestId('description-input'), { target: { value: 'A desc' } });
    fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '  Bob  ' } });
    fireEvent.click(q.getByTestId('submit-button'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const payload = onSubmit.mock.calls[0][0];
    expect(payload.assignee).toBe('Bob');
  });

  it('submitting with only whitespace in the assignee results in undefined assignee', () => {
    const onSubmit = vi.fn<(data: TicketFormData) => void>();
    const { container } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    const q = within(container);

    fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Title' } });
    fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Description' } });
    fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '   ' } });
    fireEvent.click(q.getByTestId('submit-button'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const payload = onSubmit.mock.calls[0][0];
    expect(payload.assignee).toBeUndefined();
  });

  it('submitting without touching the assignee results in undefined assignee', () => {
    const onSubmit = vi.fn<(data: TicketFormData) => void>();
    const { container } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    const q = within(container);

    fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Title' } });
    fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Description' } });
    fireEvent.click(q.getByTestId('submit-button'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const payload = onSubmit.mock.calls[0][0];
    expect(payload.assignee).toBeUndefined();
  });
});
