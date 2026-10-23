/**
 * Additional coverage tests for TicketForm.
 *
 * Covers:
 *   - TicketForm.tsx assignee onChange handler (line 113)
 *   - TicketForm.tsx title length > 200 validation branch (line 20)
 *   - TicketForm.tsx assignee?.trim() || undefined path (line 33)
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

describe('TicketForm - assignee and title-length coverage', () => {
  it('typing in the assignee field includes the trimmed value in submitted data', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(<TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />);
    try {
      const q = within(container);

      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Valid Title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Valid description' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '  Alice  ' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledOnce();
      expect(onSubmit.mock.calls[0][0].assignee).toBe('Alice');
    } finally {
      unmount();
    }
  });

  it('submitting with a whitespace-only assignee sends undefined', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(<TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />);
    try {
      const q = within(container);

      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Valid Title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Valid description' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '   ' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledOnce();
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });

  it('title exceeding 200 characters shows the length validation error', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(<TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />);
    try {
      const q = within(container);

      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'A'.repeat(201) } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Valid description' } });
      fireEvent.click(q.getByTestId('submit-button'));

      const titleError = q.getByTestId('title-error');
      expect(titleError).toBeInTheDocument();
      expect(titleError.textContent).toBe('Title must be 200 characters or less');
      expect(onSubmit).not.toHaveBeenCalled();
    } finally {
      unmount();
    }
  });

  it('title exactly 200 characters long passes validation', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(<TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />);
    try {
      const q = within(container);

      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'A'.repeat(200) } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Valid description' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(q.queryByTestId('title-error')).not.toBeInTheDocument();
      expect(onSubmit).toHaveBeenCalledOnce();
    } finally {
      unmount();
    }
  });
});
