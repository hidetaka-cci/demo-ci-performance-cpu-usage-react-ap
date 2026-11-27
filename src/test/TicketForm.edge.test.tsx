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

describe('TicketForm - title length validation', () => {
  it('title with exactly 200 characters is accepted', () => {
    const { q, onSubmit, unmount } = renderForm();
    try {
      const title200 = 'A'.repeat(200);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: title200 } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Valid description' } });
      fireEvent.click(q.getByTestId('submit-button'));
      expect(onSubmit).toHaveBeenCalledOnce();
      expect(q.queryByTestId('title-error')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('title with 201 characters shows "Title must be 200 characters or less" error', () => {
    const { q, onSubmit, unmount } = renderForm();
    try {
      const title201 = 'A'.repeat(201);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: title201 } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Valid description' } });
      fireEvent.click(q.getByTestId('submit-button'));
      expect(onSubmit).not.toHaveBeenCalled();
      const titleError = q.getByTestId('title-error');
      expect(titleError).toBeInTheDocument();
      expect(titleError.textContent).toBe('Title must be 200 characters or less');
    } finally {
      unmount();
    }
  });

  it('very long title (500 chars) shows the length error', () => {
    const { q, onSubmit, unmount } = renderForm();
    try {
      const longTitle = 'B'.repeat(500);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: longTitle } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Valid description' } });
      fireEvent.click(q.getByTestId('submit-button'));
      expect(onSubmit).not.toHaveBeenCalled();
      expect(q.getByTestId('title-error').textContent).toBe('Title must be 200 characters or less');
    } finally {
      unmount();
    }
  });
});

describe('TicketForm - assignee field', () => {
  it('assignee field input is reflected when form is submitted', () => {
    const { q, onSubmit, unmount } = renderForm();
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Valid title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Valid description' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: 'Alice' } });
      fireEvent.click(q.getByTestId('submit-button'));
      expect(onSubmit).toHaveBeenCalledOnce();
      expect(onSubmit.mock.calls[0][0].assignee).toBe('Alice');
    } finally {
      unmount();
    }
  });

  it('empty assignee field submits undefined', () => {
    const { q, onSubmit, unmount } = renderForm();
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Valid title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Valid description' } });
      fireEvent.click(q.getByTestId('submit-button'));
      expect(onSubmit).toHaveBeenCalledOnce();
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });

  it('whitespace-only assignee is treated as no assignee', () => {
    const { q, onSubmit, unmount } = renderForm();
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Valid title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Valid description' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '   ' } });
      fireEvent.click(q.getByTestId('submit-button'));
      expect(onSubmit).toHaveBeenCalledOnce();
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });
});
