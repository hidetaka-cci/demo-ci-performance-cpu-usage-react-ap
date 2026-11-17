/**
 * Tests for TicketForm edge cases not covered by TicketForm.pbt.test.tsx.
 *
 * Missing coverage:
 *   - Title longer than 200 characters triggers its own validation error
 *     (the `title.trim().length > 200` branch, s11 = 0)
 *   - The assignee input's onChange handler (f7 / s30 = 0)
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

function renderForm() {
  const onSubmit = vi.fn();
  const onCancel = vi.fn();
  const result = render(<TicketForm onSubmit={onSubmit} onCancel={onCancel} />);
  const q = within(result.container);
  return { ...result, q, onSubmit, onCancel };
}

describe('TicketForm - title length validation', () => {
  it('title exactly 201 characters shows the too-long error', () => {
    const { q, onSubmit, unmount } = renderForm();
    try {
      const longTitle = 'a'.repeat(201);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: longTitle } });
      fireEvent.change(q.getByTestId('description-input'), {
        target: { value: 'Valid description' },
      });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(q.getByTestId('title-error')).toBeInTheDocument();
      expect(q.getByTestId('title-error').textContent).toMatch(/200/);
      expect(onSubmit).not.toHaveBeenCalled();
    } finally {
      unmount();
    }
  });

  it('title exactly 200 characters is accepted without error', () => {
    const { q, onSubmit, unmount } = renderForm();
    try {
      const maxTitle = 'a'.repeat(200);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: maxTitle } });
      fireEvent.change(q.getByTestId('description-input'), {
        target: { value: 'Valid description' },
      });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(q.queryByTestId('title-error')).not.toBeInTheDocument();
      expect(onSubmit).toHaveBeenCalledOnce();
    } finally {
      unmount();
    }
  });
});

describe('TicketForm - assignee input', () => {
  it('assignee input onChange updates the displayed value', () => {
    const { q, unmount } = renderForm();
    try {
      const assigneeInput = q.getByTestId('assignee-input') as HTMLInputElement;
      fireEvent.change(assigneeInput, { target: { value: 'Bob' } });
      expect(assigneeInput.value).toBe('Bob');
    } finally {
      unmount();
    }
  });

  it('assignee value is included in submitted form data when filled', () => {
    const { q, onSubmit, unmount } = renderForm();
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'My ticket' } });
      fireEvent.change(q.getByTestId('description-input'), {
        target: { value: 'Some description' },
      });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: ' Charlie ' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledOnce();
      const submitted = onSubmit.mock.calls[0][0];
      expect(submitted.assignee).toBe('Charlie');
    } finally {
      unmount();
    }
  });

  it('empty assignee is submitted as undefined', () => {
    const { q, onSubmit, unmount } = renderForm();
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'My ticket' } });
      fireEvent.change(q.getByTestId('description-input'), {
        target: { value: 'Some description' },
      });
      // assignee left empty (default)
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledOnce();
      const submitted = onSubmit.mock.calls[0][0];
      expect(submitted.assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });

  it('whitespace-only assignee is submitted as undefined', () => {
    const { q, onSubmit, unmount } = renderForm();
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'My ticket' } });
      fireEvent.change(q.getByTestId('description-input'), {
        target: { value: 'Some description' },
      });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '   ' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledOnce();
      const submitted = onSubmit.mock.calls[0][0];
      expect(submitted.assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });
});

describe('TicketForm - getPriorityLabel and getStatusLabel coverage via ticketUtils', () => {
  it('priority select options include all priority labels', () => {
    const { q, unmount } = renderForm();
    try {
      const select = q.getByTestId('priority-select') as HTMLSelectElement;
      const labels = Array.from(select.options).map(o => o.text);
      expect(labels).toContain('Low');
      expect(labels).toContain('Medium');
      expect(labels).toContain('High');
      expect(labels).toContain('Critical');
    } finally {
      unmount();
    }
  });
});
