import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

describe('TicketForm - title length validation', () => {
  it('title over 200 chars shows length error and blocks submission', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), {
        target: { value: 'a'.repeat(201) },
      });
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

  it('title exactly 200 chars passes validation', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), {
        target: { value: 'a'.repeat(200) },
      });
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

  it('whitespace-only title shows required error and blocks submission', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), {
        target: { value: '   ' },
      });
      fireEvent.change(q.getByTestId('description-input'), {
        target: { value: 'Valid description' },
      });
      fireEvent.click(q.getByTestId('submit-button'));
      const err = q.getByTestId('title-error');
      expect(err).toBeInTheDocument();
      expect(err.textContent).toBe('Title is required');
      expect(onSubmit).not.toHaveBeenCalled();
    } finally {
      unmount();
    }
  });
});
