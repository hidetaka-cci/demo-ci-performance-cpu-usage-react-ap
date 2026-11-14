/**
 * Unit tests for TicketForm component — assignee field interaction
 *
 * Covers the uncovered line in TicketForm.tsx:
 *   - Line 113: onChange={e => setAssignee(e.target.value)}
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

function fillValidForm(container: HTMLElement, overrides: { assignee?: string } = {}) {
  fireEvent.change(within(container).getByTestId('title-input'), {
    target: { value: 'Fix the login bug' },
  });
  fireEvent.change(within(container).getByTestId('description-input'), {
    target: { value: 'Server returns 500 on bad creds' },
  });
  if (overrides.assignee !== undefined) {
    fireEvent.change(within(container).getByTestId('assignee-input'), {
      target: { value: overrides.assignee },
    });
  }
}

describe('TicketForm - assignee field', () => {
  it('changing the assignee input updates its value', () => {
    const { container } = render(<TicketForm onSubmit={vi.fn()} onCancel={vi.fn()} />);
    const input = within(container).getByTestId('assignee-input') as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'Alice' } });

    expect(input.value).toBe('Alice');
  });

  it('submitting with assignee passes trimmed assignee to onSubmit', () => {
    const onSubmit = vi.fn();
    const { container } = render(<TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    fillValidForm(container, { assignee: '  Bob  ' });
    fireEvent.submit(within(container).getByTestId('ticket-form'));

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit.mock.calls[0][0].assignee).toBe('Bob');
  });

  it('submitting with blank assignee passes undefined to onSubmit', () => {
    const onSubmit = vi.fn();
    const { container } = render(<TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    fillValidForm(container, { assignee: '   ' });
    fireEvent.submit(within(container).getByTestId('ticket-form'));

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
  });

  it('submitting without entering an assignee passes undefined to onSubmit', () => {
    const onSubmit = vi.fn();
    const { container } = render(<TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    fillValidForm(container);
    fireEvent.submit(within(container).getByTestId('ticket-form'));

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
  });

  it('title exceeding 200 characters shows an error and does not call onSubmit', () => {
    const onSubmit = vi.fn();
    const { container } = render(<TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    fireEvent.change(within(container).getByTestId('title-input'), {
      target: { value: 'a'.repeat(201) },
    });
    fireEvent.change(within(container).getByTestId('description-input'), {
      target: { value: 'Some description' },
    });
    fireEvent.submit(within(container).getByTestId('ticket-form'));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(within(container).getByTestId('title-error').textContent).toMatch(/200/);
  });

  it('changing priority select updates submitted priority value', () => {
    const onSubmit = vi.fn();
    const { container } = render(<TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    fillValidForm(container);
    fireEvent.change(within(container).getByTestId('priority-select'), {
      target: { value: 'critical' },
    });
    fireEvent.submit(within(container).getByTestId('ticket-form'));

    expect(onSubmit.mock.calls[0][0].priority).toBe('critical');
  });

  it('comma-separated tags are split and trimmed on submit', () => {
    const onSubmit = vi.fn();
    const { container } = render(<TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    fillValidForm(container);
    fireEvent.change(within(container).getByTestId('tags-input'), {
      target: { value: ' bug , frontend , urgent ' },
    });
    fireEvent.submit(within(container).getByTestId('ticket-form'));

    expect(onSubmit.mock.calls[0][0].tags).toEqual(['bug', 'frontend', 'urgent']);
  });
});
