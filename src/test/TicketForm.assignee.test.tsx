/**
 * Example-based tests for TicketForm - assignee input.
 *
 * Covers TicketForm.tsx line 113 (`onChange={e => setAssignee(e.target.value)}`).
 * The PBT suite never types into the assignee input, so both the state update
 * and the trimmed-value passthrough to onSubmit are unverified.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

describe('TicketForm - assignee input', () => {
  it('updates the assignee input value as the user types', () => {
    const { container, unmount } = render(
      <TicketForm onSubmit={vi.fn()} onCancel={vi.fn()} />
    );
    try {
      const assigneeInput = within(container).getByTestId('assignee-input') as HTMLInputElement;
      expect(assigneeInput.value).toBe('');

      fireEvent.change(assigneeInput, { target: { value: 'Charlie' } });
      expect(assigneeInput.value).toBe('Charlie');

      fireEvent.change(assigneeInput, { target: { value: 'Charlie Brown' } });
      expect(assigneeInput.value).toBe('Charlie Brown');
    } finally {
      unmount();
    }
  });

  it('passes the trimmed assignee through to onSubmit when non-empty', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'A title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'A description' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '  Dana  ' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0]).toEqual(
        expect.objectContaining({ assignee: 'Dana' })
      );
    } finally {
      unmount();
    }
  });

  it('submits assignee as undefined when the field is empty or whitespace-only', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'T' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'D' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '   ' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });
});
