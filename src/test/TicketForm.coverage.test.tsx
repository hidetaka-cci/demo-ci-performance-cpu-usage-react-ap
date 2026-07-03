/**
 * Coverage tests for TicketForm
 *
 * Target: the assignee input's onChange handler (previously uncovered).
 * These are deterministic unit tests, complementing the property-based suite.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, within } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

describe('TicketForm - assignee field', () => {
  it('forwards the trimmed assignee value to onSubmit when the field is filled', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'A title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'A description' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '  Alice  ' } });
      fireEvent.submit(q.getByTestId('ticket-form'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      const payload = onSubmit.mock.calls[0][0];
      expect(payload.assignee).toBe('Alice');
    } finally {
      unmount();
    }
  });

  it('omits assignee (undefined) when the field is left blank', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Another title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Another description' } });
      fireEvent.submit(q.getByTestId('ticket-form'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      const payload = onSubmit.mock.calls[0][0];
      expect(payload.assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });

  it('reflects typed characters back into the assignee input value', () => {
    const { container, unmount } = render(
      <TicketForm onSubmit={vi.fn()} onCancel={vi.fn()} />
    );
    try {
      const input = within(container).getByTestId('assignee-input') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'Bob' } });
      expect(input.value).toBe('Bob');
      fireEvent.change(input, { target: { value: 'Bobbie' } });
      expect(input.value).toBe('Bobbie');
    } finally {
      unmount();
    }
  });

  it('rejects titles longer than 200 characters with a validation error', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'x'.repeat(201) } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'valid description' } });
      fireEvent.submit(q.getByTestId('ticket-form'));

      expect(onSubmit).not.toHaveBeenCalled();
      const err = q.getByTestId('title-error');
      expect(err).toBeInTheDocument();
      expect(err.textContent).toMatch(/200 characters/);
    } finally {
      unmount();
    }
  });
});
