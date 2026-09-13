/**
 * Targeted tests for TicketForm.tsx title-length validation (line 113, uncovered in PBT suite).
 *
 * Covers:
 *   - Title over 200 chars triggers "Title must be 200 characters or less" and blocks submit
 *   - Title of exactly 200 chars is accepted
 *   - Title of 201 chars is rejected
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

describe('TicketForm - title length validation', () => {
  it('rejects a title longer than 200 characters with the length error', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      const longTitle = 'a'.repeat(201);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: longTitle } });
      fireEvent.change(q.getByTestId('description-input'), {
        target: { value: 'valid description' },
      });
      fireEvent.click(q.getByTestId('submit-button'));

      const err = q.getByTestId('title-error');
      expect(err).toBeInTheDocument();
      expect(err.textContent).toBe('Title must be 200 characters or less');
      expect(onSubmit).not.toHaveBeenCalled();
    } finally {
      unmount();
    }
  });

  it('accepts a title of exactly 200 characters', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      const boundaryTitle = 'a'.repeat(200);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: boundaryTitle } });
      fireEvent.change(q.getByTestId('description-input'), {
        target: { value: 'valid description' },
      });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].title).toBe(boundaryTitle);
    } finally {
      unmount();
    }
  });

  it('trims whitespace before applying the length check', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      // 200 chars of content padded with whitespace should pass (trimmed length == 200)
      const padded = '   ' + 'a'.repeat(200) + '   ';
      fireEvent.change(q.getByTestId('title-input'), { target: { value: padded } });
      fireEvent.change(q.getByTestId('description-input'), {
        target: { value: 'valid description' },
      });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].title).toBe('a'.repeat(200));
    } finally {
      unmount();
    }
  });
});
