import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

describe('TicketForm - assignee handling', () => {
  it('typing in the assignee input updates its value', () => {
    const { container, unmount } = render(
      <TicketForm onSubmit={vi.fn()} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      const assignee = q.getByTestId('assignee-input') as HTMLInputElement;
      expect(assignee.value).toBe('');
      fireEvent.change(assignee, { target: { value: 'Alice' } });
      expect(assignee.value).toBe('Alice');
    } finally {
      unmount();
    }
  });

  it('submits the trimmed assignee value when non-empty', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Some title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Some description' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '  Alice  ' } });
      fireEvent.submit(q.getByTestId('ticket-form'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0]).toMatchObject({
        title: 'Some title',
        description: 'Some description',
        assignee: 'Alice',
      });
    } finally {
      unmount();
    }
  });

  it('submits assignee as undefined when the input is empty or whitespace', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Body' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '   ' } });
      fireEvent.submit(q.getByTestId('ticket-form'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });

  it('rejects titles longer than 200 characters with a validation error', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      const longTitle = 'a'.repeat(201);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: longTitle } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Body' } });
      fireEvent.submit(q.getByTestId('ticket-form'));

      expect(onSubmit).not.toHaveBeenCalled();
      const err = q.getByTestId('title-error');
      expect(err.textContent).toMatch(/200 characters or less/);
    } finally {
      unmount();
    }
  });
});
