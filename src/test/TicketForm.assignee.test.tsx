/**
 * Unit tests for TicketForm's assignee field.
 *
 * Targets uncovered line in src/components/TicketForm.tsx line 113:
 *   onChange={e => setAssignee(e.target.value)}
 *
 * Also exercises the ternary at line 33:
 *   assignee: assignee?.trim() || undefined
 * so that both the "trimmed assignee is forwarded" branch and the
 * "whitespace-only assignee becomes undefined" branch are covered.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';
import type { TicketFormData } from '../types/ticket';

function renderForm() {
  const onSubmit = vi.fn<(data: TicketFormData) => void>();
  const onCancel = vi.fn();
  const { unmount, container } = render(
    <TicketForm onSubmit={onSubmit} onCancel={onCancel} />
  );
  return { onSubmit, onCancel, unmount, q: within(container) };
}

describe('TicketForm - assignee field', () => {
  it('typing into the assignee input updates its value', () => {
    const { q, unmount } = renderForm();
    try {
      const input = q.getByTestId('assignee-input') as HTMLInputElement;
      expect(input.value).toBe('');
      fireEvent.change(input, { target: { value: 'Alice' } });
      expect(input.value).toBe('Alice');
    } finally {
      unmount();
    }
  });

  it('submits with a trimmed assignee when one is provided', () => {
    const { q, onSubmit, unmount } = renderForm();
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Fix login' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Return 401 instead of 500' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '  Alice  ' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      const data = onSubmit.mock.calls[0][0];
      expect(data.assignee).toBe('Alice');
    } finally {
      unmount();
    }
  });

  it('submits with assignee=undefined when the field is left blank', () => {
    const { q, onSubmit, unmount } = renderForm();
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Fix login' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Return 401 instead of 500' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      const data = onSubmit.mock.calls[0][0];
      expect(data.assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });

  it('submits with assignee=undefined when the field is only whitespace', () => {
    const { q, onSubmit, unmount } = renderForm();
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Fix login' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Return 401 instead of 500' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '   ' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      const data = onSubmit.mock.calls[0][0];
      expect(data.assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });

  it('rejects a title longer than 200 characters with the length error', () => {
    // Covers the second validate() branch for title (line 20).
    const { q, onSubmit, unmount } = renderForm();
    try {
      const longTitle = 'x'.repeat(201);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: longTitle } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'desc' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).not.toHaveBeenCalled();
      const err = q.getByTestId('title-error');
      expect(err.textContent).toBe('Title must be 200 characters or less');
    } finally {
      unmount();
    }
  });
});
