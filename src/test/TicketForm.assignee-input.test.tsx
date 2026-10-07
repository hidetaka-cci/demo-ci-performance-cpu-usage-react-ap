/**
 * Unit tests for the TicketForm assignee input onChange handler.
 *
 * Targets uncovered line in src/components/TicketForm.tsx:
 *   - onChange={e => setAssignee(e.target.value)} on the assignee input
 *
 * Also exercises the trim-then-undefined branch of handleSubmit when the
 * assignee is whitespace-only.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

describe('TicketForm - assignee input', () => {
  it('typing into the assignee input updates the field value', () => {
    const { container, unmount } = render(
      <TicketForm onSubmit={vi.fn()} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      const assigneeInput = q.getByTestId('assignee-input') as HTMLInputElement;
      expect(assigneeInput.value).toBe('');

      fireEvent.change(assigneeInput, { target: { value: 'Alice' } });

      expect(assigneeInput.value).toBe('Alice');
    } finally {
      unmount();
    }
  });

  it('submits with a trimmed, non-empty assignee value', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Bug' } });
      fireEvent.change(q.getByTestId('description-input'), {
        target: { value: 'Repro steps.' },
      });
      fireEvent.change(q.getByTestId('assignee-input'), {
        target: { value: '  Bob  ' },
      });

      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      const data = onSubmit.mock.calls[0][0];
      expect(data.assignee).toBe('Bob');
    } finally {
      unmount();
    }
  });

  it('submits with assignee === undefined when the field is whitespace-only', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Bug' } });
      fireEvent.change(q.getByTestId('description-input'), {
        target: { value: 'Repro steps.' },
      });
      fireEvent.change(q.getByTestId('assignee-input'), {
        target: { value: '   ' },
      });

      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      const data = onSubmit.mock.calls[0][0];
      expect(data.assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });

  it('submits with assignee === undefined when the field is left empty', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Bug' } });
      fireEvent.change(q.getByTestId('description-input'), {
        target: { value: 'Repro steps.' },
      });

      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      const data = onSubmit.mock.calls[0][0];
      expect(data.assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });
});
