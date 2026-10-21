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

function fillRequiredFields(q: ReturnType<typeof within>) {
  fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Test Title' } });
  fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Test Description' } });
}

describe('TicketForm - assignee field', () => {
  it('typing in the assignee field updates the displayed value', () => {
    const { q, unmount } = renderForm();
    try {
      const input = q.getByTestId('assignee-input') as HTMLInputElement;
      // Triggers TicketForm.tsx:113 — onChange={e => setAssignee(e.target.value)}
      fireEvent.change(input, { target: { value: 'Alice' } });
      expect(input.value).toBe('Alice');
    } finally {
      unmount();
    }
  });

  it('submitted data includes trimmed assignee when provided', () => {
    const { q, onSubmit, unmount } = renderForm();
    try {
      fillRequiredFields(q);
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '  Alice  ' } });
      fireEvent.click(q.getByTestId('submit-button'));
      expect(onSubmit).toHaveBeenCalledOnce();
      expect(onSubmit.mock.calls[0][0].assignee).toBe('Alice');
    } finally {
      unmount();
    }
  });

  it('submitted data has undefined assignee when the field is left empty', () => {
    const { q, onSubmit, unmount } = renderForm();
    try {
      fillRequiredFields(q);
      // assignee-input intentionally not changed
      fireEvent.click(q.getByTestId('submit-button'));
      expect(onSubmit).toHaveBeenCalledOnce();
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });

  it('submitted data has undefined assignee when the field contains only whitespace', () => {
    const { q, onSubmit, unmount } = renderForm();
    try {
      fillRequiredFields(q);
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '   ' } });
      fireEvent.click(q.getByTestId('submit-button'));
      expect(onSubmit).toHaveBeenCalledOnce();
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });
});
