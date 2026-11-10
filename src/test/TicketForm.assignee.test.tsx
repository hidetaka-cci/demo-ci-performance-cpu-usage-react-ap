/**
 * Tests for TicketForm's assignee field and long-title validation path.
 *
 * Covers the gaps left by TicketForm.pbt.test.tsx:
 *   - Line 113: assignee onChange handler (setAssignee never called by PBT tests)
 *   - Branch: assignee?.trim() || undefined when assignee is non-empty
 *   - Validation: title > 200 chars shows the length-limit error
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

describe('TicketForm - assignee field', () => {
  it('changing the assignee input updates the displayed value', () => {
    const { q, unmount } = renderForm();
    try {
      const input = q.getByTestId('assignee-input') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'Bob' } });
      expect(input.value).toBe('Bob');
    } finally {
      unmount();
    }
  });

  it('a non-empty assignee is included in submitted form data', () => {
    const { q, onSubmit, unmount } = renderForm();
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Fix bug' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Details here' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '  Alice  ' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledOnce();
      expect(onSubmit.mock.calls[0][0].assignee).toBe('Alice');
    } finally {
      unmount();
    }
  });

  it('a whitespace-only assignee is treated as undefined in submitted data', () => {
    const { q, onSubmit, unmount } = renderForm();
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Fix bug' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Details here' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '   ' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledOnce();
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });
});

describe('TicketForm - title length validation', () => {
  it('title longer than 200 characters shows the length-limit error', () => {
    const { q, onSubmit, unmount } = renderForm();
    try {
      const longTitle = 'A'.repeat(201);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: longTitle } });
      fireEvent.change(q.getByTestId('description-input'), {
        target: { value: 'Some description' },
      });
      fireEvent.click(q.getByTestId('submit-button'));

      const errorEl = q.getByTestId('title-error');
      expect(errorEl.textContent).toBe('Title must be 200 characters or less');
      expect(onSubmit).not.toHaveBeenCalled();
    } finally {
      unmount();
    }
  });

  it('title of exactly 200 characters is accepted without error', () => {
    const { q, onSubmit, unmount } = renderForm();
    try {
      const exactTitle = 'B'.repeat(200);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: exactTitle } });
      fireEvent.change(q.getByTestId('description-input'), {
        target: { value: 'Some description' },
      });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(q.queryByTestId('title-error')).not.toBeInTheDocument();
      expect(onSubmit).toHaveBeenCalledOnce();
    } finally {
      unmount();
    }
  });
});
