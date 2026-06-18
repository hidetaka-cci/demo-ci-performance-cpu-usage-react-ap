/**
 * Deterministic coverage tests for TicketForm's assignee input.
 *
 * Targets src/components/TicketForm.tsx:113 — the assignee onChange handler
 * (`onChange={e => setAssignee(e.target.value)}`) and the
 * `assignee?.trim() || undefined` branch in handleSubmit.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

describe('TicketForm - assignee coverage', () => {
  it('typing into the assignee input updates the value', () => {
    const { container, unmount } = render(
      <TicketForm onSubmit={vi.fn()} onCancel={vi.fn()} />
    );
    try {
      const input = within(container).getByTestId('assignee-input') as HTMLInputElement;
      expect(input.value).toBe('');

      fireEvent.change(input, { target: { value: 'Dana' } });
      expect(input.value).toBe('Dana');
    } finally {
      unmount();
    }
  });

  it('submitting with a non-empty assignee passes the trimmed name to onSubmit', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Has assignee' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Body' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '  Erin  ' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].assignee).toBe('Erin');
    } finally {
      unmount();
    }
  });

  it('submitting with a whitespace-only assignee yields undefined assignee', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Whitespace assignee' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Body' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '   ' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });

  it('submitting without touching the assignee yields undefined assignee', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'No assignee' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Body' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });
});
