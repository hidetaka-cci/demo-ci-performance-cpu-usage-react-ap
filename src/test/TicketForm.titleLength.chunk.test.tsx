import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';
import type { TicketFormData } from '../types/ticket';

function fillDescription(q: ReturnType<typeof within>, value = 'A valid description') {
  fireEvent.change(q.getByTestId('description-input'), { target: { value } });
}

describe('TicketForm - title length validation', () => {
  it('submits when the title is exactly 200 characters (boundary — allowed)', () => {
    const onSubmit = vi.fn();
    const { container } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    const q = within(container);

    const title = 'a'.repeat(200);
    fireEvent.change(q.getByTestId('title-input'), { target: { value: title } });
    fillDescription(q);

    fireEvent.click(q.getByTestId('submit-button'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const payload = onSubmit.mock.calls[0][0] as TicketFormData;
    expect(payload.title).toBe(title);
    expect(q.queryByTestId('title-error')).not.toBeInTheDocument();
  });

  it('shows the length error and blocks submit when the title is 201 characters (boundary — rejected)', () => {
    const onSubmit = vi.fn();
    const { container } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    const q = within(container);

    const title = 'a'.repeat(201);
    fireEvent.change(q.getByTestId('title-input'), { target: { value: title } });
    fillDescription(q);

    fireEvent.click(q.getByTestId('submit-button'));

    expect(onSubmit).not.toHaveBeenCalled();
    const err = q.getByTestId('title-error');
    expect(err).toBeInTheDocument();
    expect(err.textContent).toBe('Title must be 200 characters or less');
  });

  it('shows the length error for a clearly oversized (1000-char) title', () => {
    const onSubmit = vi.fn();
    const { container } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    const q = within(container);

    fireEvent.change(q.getByTestId('title-input'), { target: { value: 'x'.repeat(1000) } });
    fillDescription(q);

    fireEvent.click(q.getByTestId('submit-button'));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(q.getByTestId('title-error').textContent).toBe('Title must be 200 characters or less');
  });

  it('measures length after trimming — whitespace padding does not bypass the 200-char limit', () => {
    const onSubmit = vi.fn();
    const { container } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    const q = within(container);

    const padded = '   ' + 'a'.repeat(201) + '   ';
    fireEvent.change(q.getByTestId('title-input'), { target: { value: padded } });
    fillDescription(q);

    fireEvent.click(q.getByTestId('submit-button'));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(q.getByTestId('title-error').textContent).toBe('Title must be 200 characters or less');
  });

  it('measures length after trimming — padded 200-char title submits successfully', () => {
    const onSubmit = vi.fn();
    const { container } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    const q = within(container);

    const inner = 'b'.repeat(200);
    fireEvent.change(q.getByTestId('title-input'), { target: { value: `  ${inner}  ` } });
    fillDescription(q);

    fireEvent.click(q.getByTestId('submit-button'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const payload = onSubmit.mock.calls[0][0] as TicketFormData;
    expect(payload.title).toBe(inner);
    expect(q.queryByTestId('title-error')).not.toBeInTheDocument();
  });

  it('replaces the length error with a fresh submission once the title is shortened', () => {
    const onSubmit = vi.fn();
    const { container } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    const q = within(container);

    fireEvent.change(q.getByTestId('title-input'), { target: { value: 'z'.repeat(250) } });
    fillDescription(q);
    fireEvent.click(q.getByTestId('submit-button'));

    expect(q.getByTestId('title-error')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();

    fireEvent.change(q.getByTestId('title-input'), { target: { value: 'short title' } });
    fireEvent.click(q.getByTestId('submit-button'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const payload = onSubmit.mock.calls[0][0] as TicketFormData;
    expect(payload.title).toBe('short title');
  });
});
