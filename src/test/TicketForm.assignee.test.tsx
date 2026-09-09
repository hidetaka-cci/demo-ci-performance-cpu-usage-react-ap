/**
 * Coverage-focused tests for TicketForm.tsx
 *
 * Covers the previously uncovered assignee input onChange handler and its
 * inclusion in the submitted payload.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

describe('TicketForm - assignee input', () => {
  it('typing into assignee updates the input value', () => {
    const { container } = render(<TicketForm onSubmit={vi.fn()} onCancel={vi.fn()} />);

    const assignee = within(container).getByTestId('assignee-input') as HTMLInputElement;
    fireEvent.change(assignee, { target: { value: 'Alice' } });

    expect(assignee.value).toBe('Alice');
  });

  it('submits trimmed assignee value when provided', () => {
    const onSubmit = vi.fn();
    const { container } = render(<TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />);
    const q = within(container);

    fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Fix bug' } });
    fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Steps to reproduce' } });
    fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '  Alice  ' } });

    fireEvent.click(q.getByTestId('submit-button'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      title: 'Fix bug',
      description: 'Steps to reproduce',
      assignee: 'Alice',
    });
  });

  it('submits undefined assignee when the input is empty or whitespace', () => {
    const onSubmit = vi.fn();
    const { container } = render(<TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />);
    const q = within(container);

    fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Fix bug' } });
    fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Details' } });
    fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '   ' } });

    fireEvent.click(q.getByTestId('submit-button'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
  });
});
