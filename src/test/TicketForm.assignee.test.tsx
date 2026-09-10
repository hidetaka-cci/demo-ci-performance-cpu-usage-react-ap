/**
 * Coverage tests for TicketForm - assignee input handling.
 *
 * Targets TicketForm.tsx line 113: onChange={e => setAssignee(e.target.value)}
 * and covers assignee handling in the submitted TicketFormData (trim rules,
 * undefined-when-empty).
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

function fillRequired(q: ReturnType<typeof within>) {
  fireEvent.change(q.getByTestId('title-input'), { target: { value: 'A title' } });
  fireEvent.change(q.getByTestId('description-input'), { target: { value: 'A description' } });
}

describe('TicketForm - assignee input', () => {
  it('assignee input への入力が反映される', () => {
    const { container } = render(<TicketForm onSubmit={vi.fn()} onCancel={vi.fn()} />);
    const q = within(container);
    const input = q.getByTestId('assignee-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Alice' } });
    expect(input.value).toBe('Alice');
  });

  it('assignee 入力あり: submit データに trim された値が含まれる', () => {
    const onSubmit = vi.fn();
    const { container } = render(<TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />);
    const q = within(container);

    fillRequired(q);
    fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '  Bob  ' } });
    fireEvent.click(q.getByTestId('submit-button'));

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit.mock.calls[0][0].assignee).toBe('Bob');
  });

  it('assignee 空欄: submit データの assignee は undefined', () => {
    const onSubmit = vi.fn();
    const { container } = render(<TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />);
    const q = within(container);

    fillRequired(q);
    fireEvent.click(q.getByTestId('submit-button'));

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
  });

  it('assignee が空白のみ: submit データの assignee は undefined', () => {
    const onSubmit = vi.fn();
    const { container } = render(<TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />);
    const q = within(container);

    fillRequired(q);
    fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '   ' } });
    fireEvent.click(q.getByTestId('submit-button'));

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
  });
});
