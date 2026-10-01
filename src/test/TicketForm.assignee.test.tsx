/**
 * Coverage tests for TicketForm's assignee input.
 *
 * Covers the assignee onChange handler (TicketForm.tsx L113) which was
 * previously 0% covered by the PBT suite — no existing test typed into
 * the assignee field, so neither the input update nor the "assignee
 * forwarded to onSubmit" branch of the submit path was exercised.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

function renderForm() {
  const onSubmit = vi.fn();
  const onCancel = vi.fn();
  const result = render(<TicketForm onSubmit={onSubmit} onCancel={onCancel} />);
  return { ...result, q: within(result.container), onSubmit, onCancel };
}

describe('TicketForm - assignee input', () => {
  it('typing into the assignee input updates its value', () => {
    const { q, unmount } = renderForm();
    try {
      const assignee = q.getByTestId('assignee-input') as HTMLInputElement;
      expect(assignee.value).toBe('');
      fireEvent.change(assignee, { target: { value: 'Alice' } });
      expect(assignee.value).toBe('Alice');
    } finally {
      unmount();
    }
  });

  it('submits with trimmed assignee when provided', () => {
    const { q, onSubmit, unmount } = renderForm();
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Fix bug' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'A description' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '  Bob  ' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      const data = onSubmit.mock.calls[0][0];
      expect(data.assignee).toBe('Bob');
    } finally {
      unmount();
    }
  });

  it('submits with undefined assignee when input is empty or whitespace', () => {
    const { q, onSubmit, unmount } = renderForm();
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Fix bug' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'A description' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '   ' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      const data = onSubmit.mock.calls[0][0];
      expect(data.assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });
});
