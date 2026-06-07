import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

describe('TicketForm - assignee input', () => {
  it('updates the assignee input value when the user types', () => {
    const { container } = render(
      <TicketForm onSubmit={vi.fn()} onCancel={vi.fn()} />
    );

    const assigneeInput = within(container).getByTestId('assignee-input') as HTMLInputElement;
    expect(assigneeInput.value).toBe('');

    fireEvent.change(assigneeInput, { target: { value: 'Charlie' } });

    expect(assigneeInput.value).toBe('Charlie');
  });

  it('submits trimmed assignee when populated', () => {
    const onSubmit = vi.fn();
    const { container } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    const q = within(container);

    fireEvent.change(q.getByTestId('title-input'), { target: { value: 'My ticket' } });
    fireEvent.change(q.getByTestId('description-input'), { target: { value: 'A description.' } });
    fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '  Charlie  ' } });
    fireEvent.click(q.getByTestId('submit-button'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ assignee: 'Charlie' })
    );
  });

  it('submits with assignee undefined when the field is left blank or whitespace', () => {
    const onSubmit = vi.fn();
    const { container } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    const q = within(container);

    fireEvent.change(q.getByTestId('title-input'), { target: { value: 'No assignee' } });
    fireEvent.change(q.getByTestId('description-input'), { target: { value: 'desc' } });
    fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '   ' } });
    fireEvent.click(q.getByTestId('submit-button'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
  });
});
