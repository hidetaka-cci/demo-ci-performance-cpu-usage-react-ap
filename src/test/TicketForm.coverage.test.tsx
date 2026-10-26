import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

describe('TicketForm - assignee input', () => {
  it('typing in the assignee field updates its value', () => {
    const { container, unmount } = render(<TicketForm onSubmit={vi.fn()} onCancel={vi.fn()} />);
    try {
      const q = within(container);
      const assigneeInput = q.getByTestId('assignee-input') as HTMLInputElement;
      fireEvent.change(assigneeInput, { target: { value: 'Alice' } });
      expect(assigneeInput.value).toBe('Alice');
    } finally {
      unmount();
    }
  });

  it('submitting with an assignee passes assignee to onSubmit', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(<TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />);
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Fix login bug' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Detailed description' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: 'Bob' } });
      fireEvent.click(q.getByTestId('submit-button'));
      expect(onSubmit).toHaveBeenCalledOnce();
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ assignee: 'Bob' }));
    } finally {
      unmount();
    }
  });

  it('submitting with blank assignee passes undefined as assignee', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(<TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />);
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Fix login bug' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Detailed description' } });
      fireEvent.click(q.getByTestId('submit-button'));
      expect(onSubmit).toHaveBeenCalledOnce();
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });

  it('submitting a title longer than 200 characters shows a title error', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(<TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />);
    try {
      const q = within(container);
      const longTitle = 'A'.repeat(201);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: longTitle } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Some description' } });
      fireEvent.click(q.getByTestId('submit-button'));
      expect(q.getByTestId('title-error').textContent).toBe('Title must be 200 characters or less');
      expect(onSubmit).not.toHaveBeenCalled();
    } finally {
      unmount();
    }
  });
});
