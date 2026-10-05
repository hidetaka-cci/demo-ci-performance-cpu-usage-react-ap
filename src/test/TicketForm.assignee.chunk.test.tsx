import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';
import type { TicketFormData } from '../types/ticket';

function fillRequired(q: ReturnType<typeof within>) {
  fireEvent.change(q.getByTestId('title-input'), {
    target: { value: 'A valid title' },
  });
  fireEvent.change(q.getByTestId('description-input'), {
    target: { value: 'A valid description' },
  });
}

describe('TicketForm - assignee input', () => {
  it('starts empty', () => {
    const { container } = render(
      <TicketForm onSubmit={vi.fn()} onCancel={vi.fn()} />
    );
    const input = within(container).getByTestId('assignee-input') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.value).toBe('');
  });

  it('updates its value as the user types', () => {
    const { container } = render(
      <TicketForm onSubmit={vi.fn()} onCancel={vi.fn()} />
    );
    const input = within(container).getByTestId('assignee-input') as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'Charlie' } });
    expect(input.value).toBe('Charlie');

    fireEvent.change(input, { target: { value: 'Dana' } });
    expect(input.value).toBe('Dana');
  });

  it('includes the trimmed assignee in the submitted payload', () => {
    const onSubmit = vi.fn();
    const { container } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    const q = within(container);
    fillRequired(q);
    fireEvent.change(q.getByTestId('assignee-input'), {
      target: { value: '  Eve  ' },
    });

    fireEvent.click(q.getByTestId('submit-button'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const payload = onSubmit.mock.calls[0][0] as TicketFormData;
    expect(payload.assignee).toBe('Eve');
  });

  it('omits assignee (undefined) when the field is left blank', () => {
    const onSubmit = vi.fn();
    const { container } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    const q = within(container);
    fillRequired(q);

    fireEvent.click(q.getByTestId('submit-button'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const payload = onSubmit.mock.calls[0][0] as TicketFormData;
    expect(payload.assignee).toBeUndefined();
  });

  it('omits assignee (undefined) when the field contains only whitespace', () => {
    const onSubmit = vi.fn();
    const { container } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    const q = within(container);
    fillRequired(q);
    fireEvent.change(q.getByTestId('assignee-input'), {
      target: { value: '   ' },
    });

    fireEvent.click(q.getByTestId('submit-button'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const payload = onSubmit.mock.calls[0][0] as TicketFormData;
    expect(payload.assignee).toBeUndefined();
  });

  it('does not trigger onSubmit when assignee is typed but title is missing', () => {
    const onSubmit = vi.fn();
    const { container } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    const q = within(container);

    fireEvent.change(q.getByTestId('description-input'), {
      target: { value: 'A valid description' },
    });
    fireEvent.change(q.getByTestId('assignee-input'), {
      target: { value: 'Frank' },
    });
    fireEvent.click(q.getByTestId('submit-button'));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(q.getByTestId('title-error')).toBeInTheDocument();
  });
});
