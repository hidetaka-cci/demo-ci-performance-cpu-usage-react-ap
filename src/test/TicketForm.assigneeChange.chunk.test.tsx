/**
 * Unit tests for TicketForm assignee input and length-limited title validation.
 *
 * Covers:
 *  - Line ~113 in TicketForm.tsx: the assignee input's onChange handler,
 *    which is not otherwise exercised by the existing PBT suite.
 *  - Line ~20 in TicketForm.tsx: the branch that rejects titles longer than
 *    200 characters.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

describe('TicketForm - assignee input (coverage)', () => {
  it('updates the assignee value as the user types', () => {
    const { container, unmount } = render(
      <TicketForm onSubmit={vi.fn()} onCancel={vi.fn()} />
    );
    try {
      const input = within(container).getByTestId('assignee-input') as HTMLInputElement;
      expect(input.value).toBe('');
      fireEvent.change(input, { target: { value: 'Bob' } });
      expect(input.value).toBe('Bob');
    } finally {
      unmount();
    }
  });

  it('forwards the trimmed assignee value on submit', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Bug' } });
      fireEvent.change(q.getByTestId('description-input'), {
        target: { value: 'something broken' },
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

  it('omits assignee entirely when the field is blank or whitespace-only', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Bug' } });
      fireEvent.change(q.getByTestId('description-input'), {
        target: { value: 'something broken' },
      });
      fireEvent.change(q.getByTestId('assignee-input'), {
        target: { value: '   ' },
      });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });
});

describe('TicketForm - title length validation (coverage)', () => {
  it('rejects titles longer than 200 characters and shows a specific error', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      const overlongTitle = 'a'.repeat(201);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: overlongTitle } });
      fireEvent.change(q.getByTestId('description-input'), {
        target: { value: 'ok description' },
      });
      fireEvent.click(q.getByTestId('submit-button'));

      const error = q.getByTestId('title-error');
      expect(error).toBeInTheDocument();
      expect(error.textContent).toBe('Title must be 200 characters or less');
      expect(onSubmit).not.toHaveBeenCalled();
    } finally {
      unmount();
    }
  });

  it('accepts titles at exactly the 200-character boundary', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      const boundaryTitle = 'a'.repeat(200);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: boundaryTitle } });
      fireEvent.change(q.getByTestId('description-input'), {
        target: { value: 'ok description' },
      });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].title).toBe(boundaryTitle);
    } finally {
      unmount();
    }
  });
});
