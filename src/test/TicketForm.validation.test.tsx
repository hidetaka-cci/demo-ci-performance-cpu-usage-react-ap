/**
 * Validation edge-case tests for TicketForm.
 *
 * The existing PBT suite covers empty-title and empty-description
 * validation, but two branches inside `validate()` and `handleSubmit()`
 * are never exercised:
 *
 *   1. Title length > 200 → "Title must be 200 characters or less"
 *   2. assignee `''` / whitespace → submitted as `undefined`
 *      vs. assignee with content → submitted trimmed.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

describe('TicketForm - title length validation', () => {
  it('rejects a title longer than 200 characters and surfaces the length error', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      const longTitle = 'a'.repeat(201);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: longTitle } });
      fireEvent.change(q.getByTestId('description-input'), {
        target: { value: 'Valid description' },
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
      const maxTitle = 'a'.repeat(200);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: maxTitle } });
      fireEvent.change(q.getByTestId('description-input'), {
        target: { value: 'Valid description' },
      });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].title).toBe(maxTitle);
    } finally {
      unmount();
    }
  });
});

describe('TicketForm - assignee field handling', () => {
  it('submits assignee as undefined when the input is empty', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'A title' } });
      fireEvent.change(q.getByTestId('description-input'), {
        target: { value: 'A description' },
      });
      // Leave assignee blank.
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });

  it('submits assignee as undefined when the input is only whitespace', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'A title' } });
      fireEvent.change(q.getByTestId('description-input'), {
        target: { value: 'A description' },
      });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '   ' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });

  it('submits assignee trimmed when the input has surrounding whitespace', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'A title' } });
      fireEvent.change(q.getByTestId('description-input'), {
        target: { value: 'A description' },
      });
      fireEvent.change(q.getByTestId('assignee-input'), {
        target: { value: '  Alice  ' },
      });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].assignee).toBe('Alice');
    } finally {
      unmount();
    }
  });

  it('shows both title and description errors when both fields are blank', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      // Both fields blank, click submit.
      fireEvent.click(q.getByTestId('submit-button'));

      expect(q.getByTestId('title-error')).toBeInTheDocument();
      expect(q.getByTestId('description-error')).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    } finally {
      unmount();
    }
  });
});
