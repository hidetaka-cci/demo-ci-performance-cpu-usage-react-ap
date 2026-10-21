import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

function renderForm() {
  const onSubmit = vi.fn();
  const result = render(<TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />);
  const q = within(result.container);
  return { ...result, q, onSubmit };
}

describe('TicketForm - title length validation', () => {
  it('shows an error and does not submit when title exceeds 200 characters', () => {
    const { q, onSubmit, unmount } = renderForm();
    try {
      const longTitle = 'a'.repeat(201);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: longTitle } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Valid description' } });

      // Triggers TicketForm.tsx:20 — if (title.trim().length > 200) branch
      fireEvent.click(q.getByTestId('submit-button'));

      expect(q.getByTestId('title-error').textContent).toBe('Title must be 200 characters or less');
      expect(onSubmit).not.toHaveBeenCalled();
    } finally {
      unmount();
    }
  });

  it('accepts a title of exactly 200 characters', () => {
    const { q, onSubmit, unmount } = renderForm();
    try {
      const exactTitle = 'a'.repeat(200);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: exactTitle } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Valid description' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(q.queryByTestId('title-error')).not.toBeInTheDocument();
      expect(onSubmit).toHaveBeenCalledOnce();
      expect(onSubmit.mock.calls[0][0].title).toBe(exactTitle);
    } finally {
      unmount();
    }
  });
});
