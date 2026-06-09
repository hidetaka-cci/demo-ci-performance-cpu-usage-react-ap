/**
 * Targeted coverage tests for TicketForm title length validation.
 *
 * The PBT suite always generates titles within the allowed length, so
 * the `if (title.trim().length > 200) errs.title = ...` branch in
 * TicketForm.validate is never exercised. These tests cover:
 *   - titles longer than 200 characters surface the length error
 *   - the 201-character boundary triggers the error
 *   - exactly 200 characters is accepted (boundary, no error)
 *   - leading/trailing whitespace is trimmed before the length check
 *   - the length error blocks submission (onSubmit is not called)
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

describe('TicketForm - title length validation', () => {
  it('shows the length error when the title exceeds 200 characters', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      const longTitle = 'a'.repeat(250);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: longTitle } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'A valid description.' } });
      fireEvent.click(q.getByTestId('submit-button'));

      const titleError = q.getByTestId('title-error');
      expect(titleError).toBeInTheDocument();
      expect(titleError.textContent).toBe('Title must be 200 characters or less');
      expect(onSubmit).not.toHaveBeenCalled();
    } finally {
      unmount();
    }
  });

  it('triggers the length error at the 201-character boundary', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      const boundaryTitle = 'a'.repeat(201);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: boundaryTitle } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'A valid description.' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(q.getByTestId('title-error').textContent).toBe('Title must be 200 characters or less');
      expect(onSubmit).not.toHaveBeenCalled();
    } finally {
      unmount();
    }
  });

  it('accepts exactly 200 characters without surfacing the length error', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      const boundaryTitle = 'a'.repeat(200);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: boundaryTitle } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'A valid description.' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(q.queryByTestId('title-error')).not.toBeInTheDocument();
      expect(onSubmit).toHaveBeenCalledOnce();
      const submitted = onSubmit.mock.calls[0][0];
      expect(submitted.title).toBe(boundaryTitle);
    } finally {
      unmount();
    }
  });

  it('measures length after trimming whitespace', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      // 200 real characters padded with whitespace — trimmed length is 200, so accepted.
      const padded = '   ' + 'a'.repeat(200) + '   ';
      fireEvent.change(q.getByTestId('title-input'), { target: { value: padded } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'A valid description.' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(q.queryByTestId('title-error')).not.toBeInTheDocument();
      expect(onSubmit).toHaveBeenCalledOnce();
      // Submitted value should be the trimmed title.
      expect(onSubmit.mock.calls[0][0].title).toBe('a'.repeat(200));
    } finally {
      unmount();
    }
  });

  it('an empty title takes precedence over the length error', () => {
    // A blank-after-trim title surfaces the "required" message, not the length one,
    // because the validate() function checks emptiness before length.
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      // Whitespace-only title: trims to empty, so the "required" branch wins.
      fireEvent.change(q.getByTestId('title-input'), { target: { value: '     ' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'desc' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(q.getByTestId('title-error').textContent).toBe('Title is required');
      expect(onSubmit).not.toHaveBeenCalled();
    } finally {
      unmount();
    }
  });
});
