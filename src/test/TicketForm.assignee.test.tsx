/**
 * Coverage-targeted tests for TicketForm's assignee field.
 *
 * Targets src/components/TicketForm.tsx line 113 — the assignee `onChange`
 * handler — which the PBT suite never types into.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';
import type { TicketFormData } from '../types/ticket';

describe('TicketForm - assignee field', () => {
  it('updates the assignee input value on user input', () => {
    const { container, unmount } = render(
      <TicketForm onSubmit={vi.fn()} onCancel={vi.fn()} />
    );
    try {
      const assignee = within(container).getByTestId('assignee-input') as HTMLInputElement;
      expect(assignee.value).toBe('');
      fireEvent.change(assignee, { target: { value: 'Alice' } });
      expect(assignee.value).toBe('Alice');
    } finally {
      unmount();
    }
  });

  it('passes the trimmed assignee to onSubmit', () => {
    const onSubmit = vi.fn<(data: TicketFormData) => void>();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Desc' } });
      fireEvent.change(q.getByTestId('assignee-input'), {
        target: { value: '   Alice   ' },
      });
      fireEvent.submit(q.getByTestId('ticket-form'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      const payload = onSubmit.mock.calls[0][0];
      expect(payload.assignee).toBe('Alice');
    } finally {
      unmount();
    }
  });

  it('submits assignee as undefined when the field is blank or whitespace-only', () => {
    const onSubmit = vi.fn<(data: TicketFormData) => void>();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Desc' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '   ' } });
      fireEvent.submit(q.getByTestId('ticket-form'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      const payload = onSubmit.mock.calls[0][0];
      expect(payload.assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });
});
