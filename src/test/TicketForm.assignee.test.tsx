/**
 * Tests for TicketForm's assignee field.
 *
 * Targets the assignee onChange handler (TicketForm.tsx line 113) and the
 * `assignee?.trim() || undefined` branch in handleSubmit, neither of which
 * was reached by existing tests.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

describe('TicketForm - assignee field', () => {
  it('typed assignee value is reflected in the input and trimmed on submit', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      const assignee = q.getByTestId('assignee-input') as HTMLInputElement;

      fireEvent.change(assignee, { target: { value: '  Alice  ' } });
      expect(assignee.value).toBe('  Alice  ');

      fireEvent.change(q.getByTestId('title-input'), {
        target: { value: 'Fix bug' },
      });
      fireEvent.change(q.getByTestId('description-input'), {
        target: { value: 'Something is broken' },
      });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0]).toMatchObject({
        title: 'Fix bug',
        description: 'Something is broken',
        assignee: 'Alice',
      });
    } finally {
      unmount();
    }
  });

  it('whitespace-only assignee submits as undefined', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('assignee-input'), {
        target: { value: '   ' },
      });
      fireEvent.change(q.getByTestId('title-input'), {
        target: { value: 'Title' },
      });
      fireEvent.change(q.getByTestId('description-input'), {
        target: { value: 'Description' },
      });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });

  it('omitted assignee submits as undefined', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), {
        target: { value: 'Title' },
      });
      fireEvent.change(q.getByTestId('description-input'), {
        target: { value: 'Description' },
      });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });
});
