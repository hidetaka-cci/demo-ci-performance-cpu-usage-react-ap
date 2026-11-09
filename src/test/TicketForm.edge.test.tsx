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

describe('TicketForm - assignee input', () => {
  it('changing the assignee input does not throw', () => {
    const { q, unmount } = renderForm();
    try {
      expect(() => {
        fireEvent.change(q.getByTestId('assignee-input'), { target: { value: 'Alice' } });
      }).not.toThrow();
    } finally {
      unmount();
    }
  });

  it('assignee value is included in submitted form data', () => {
    const { q, onSubmit, unmount } = renderForm();
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'My title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'My description' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '  Bob  ' } });
      fireEvent.click(q.getByTestId('submit-button'));
      expect(onSubmit).toHaveBeenCalledOnce();
      expect(onSubmit.mock.calls[0][0].assignee).toBe('Bob');
    } finally {
      unmount();
    }
  });

  it('empty assignee is submitted as undefined', () => {
    const { q, onSubmit, unmount } = renderForm();
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'My title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'My description' } });
      fireEvent.click(q.getByTestId('submit-button'));
      expect(onSubmit).toHaveBeenCalledOnce();
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });
});

describe('TicketForm - title length validation', () => {
  it('title longer than 200 characters shows a validation error', () => {
    const { q, onSubmit, unmount } = renderForm();
    try {
      const longTitle = 'a'.repeat(201);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: longTitle } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Valid description' } });
      fireEvent.click(q.getByTestId('submit-button'));
      expect(q.getByTestId('title-error')).toBeInTheDocument();
      expect(q.getByTestId('title-error').textContent).toContain('200');
      expect(onSubmit).not.toHaveBeenCalled();
    } finally {
      unmount();
    }
  });

  it('title of exactly 200 characters is accepted', () => {
    const { q, onSubmit, unmount } = renderForm();
    try {
      const exactTitle = 'a'.repeat(200);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: exactTitle } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Valid description' } });
      fireEvent.click(q.getByTestId('submit-button'));
      expect(q.queryByTestId('title-error')).not.toBeInTheDocument();
      expect(onSubmit).toHaveBeenCalledOnce();
    } finally {
      unmount();
    }
  });
});
