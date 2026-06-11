/**
 * Deterministic coverage test for the title-length validation branch in
 * TicketForm.tsx (line 20). The existing PBT + assignee coverage suites never
 * exercise titles longer than 200 characters, leaving this branch uncovered.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

describe('TicketForm - title length validation', () => {
  it('rejects titles longer than 200 characters with the length error', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      const longTitle = 'a'.repeat(201);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: longTitle } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'desc' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).not.toHaveBeenCalled();
      expect(q.getByTestId('title-error').textContent).toBe('Title must be 200 characters or less');
    } finally {
      unmount();
    }
  });

  it('accepts titles of exactly 200 characters (boundary)', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      const boundaryTitle = 'b'.repeat(200);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: boundaryTitle } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'desc' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].title).toBe(boundaryTitle);
      expect(q.queryByTestId('title-error')).toBeNull();
    } finally {
      unmount();
    }
  });

  it('uses trimmed length so whitespace padding cannot bypass the limit', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      const padded = '   ' + 'c'.repeat(201) + '   ';
      fireEvent.change(q.getByTestId('title-input'), { target: { value: padded } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'desc' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).not.toHaveBeenCalled();
      expect(q.getByTestId('title-error').textContent).toBe('Title must be 200 characters or less');
    } finally {
      unmount();
    }
  });
});
