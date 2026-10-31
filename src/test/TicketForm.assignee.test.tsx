import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

describe('TicketForm - assignee input', () => {
  it('typing in the assignee field is reflected in submitted data', () => {
    const onSubmit = vi.fn();
    const { container } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    const q = within(container);

    fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Bug report' } });
    fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Something is broken.' } });
    fireEvent.change(q.getByTestId('assignee-input'), { target: { value: 'Alice' } });
    fireEvent.click(q.getByTestId('submit-button'));

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit.mock.calls[0][0].assignee).toBe('Alice');
  });

  it('submitting with an empty assignee omits the assignee field', () => {
    const onSubmit = vi.fn();
    const { container } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    const q = within(container);

    fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Bug report' } });
    fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Something is broken.' } });
    fireEvent.click(q.getByTestId('submit-button'));

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
  });

  it('assignee value is trimmed before submission', () => {
    const onSubmit = vi.fn();
    const { container } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    const q = within(container);

    fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Bug report' } });
    fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Something is broken.' } });
    fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '  Bob  ' } });
    fireEvent.click(q.getByTestId('submit-button'));

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit.mock.calls[0][0].assignee).toBe('Bob');
  });

  it('title over 200 chars shows validation error', () => {
    const onSubmit = vi.fn();
    const { container } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    const q = within(container);

    const longTitle = 'A'.repeat(201);
    fireEvent.change(q.getByTestId('title-input'), { target: { value: longTitle } });
    fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Valid description.' } });
    fireEvent.click(q.getByTestId('submit-button'));

    expect(q.getByTestId('title-error').textContent).toContain('200 characters');
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
