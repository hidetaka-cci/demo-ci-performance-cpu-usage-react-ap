/**
 * Unit tests for TicketForm's assignee input.
 *
 * Targets uncovered line 113 in src/components/TicketForm.tsx:
 *   onChange={e => setAssignee(e.target.value)}
 * and the assignee?.trim() || undefined branch on line 33.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TicketForm } from '../components/TicketForm';

describe('TicketForm - assignee input', () => {
  it('assignee 入力欄への型付けで value が反映される', async () => {
    const user = userEvent.setup();
    const { container } = render(<TicketForm onSubmit={vi.fn()} onCancel={vi.fn()} />);

    const input = within(container).getByTestId('assignee-input') as HTMLInputElement;
    expect(input.value).toBe('');

    await user.type(input, 'Alice');
    expect(input.value).toBe('Alice');
  });

  it('assignee を入れて submit すると trim された値が onSubmit に渡る', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    const { container } = render(<TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />);
    const q = within(container);

    await user.type(q.getByTestId('title-input'), 'A ticket');
    await user.type(q.getByTestId('description-input'), 'Details here');
    await user.type(q.getByTestId('assignee-input'), '  Bob  ');
    await user.click(q.getByTestId('submit-button'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      title: 'A ticket',
      description: 'Details here',
      assignee: 'Bob',
    });
  });

  it('空白のみの assignee は undefined として submit される', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    const { container } = render(<TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />);
    const q = within(container);

    await user.type(q.getByTestId('title-input'), 'Another');
    await user.type(q.getByTestId('description-input'), 'Something');
    await user.type(q.getByTestId('assignee-input'), '   ');
    await user.click(q.getByTestId('submit-button'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
  });

  it('assignee 未入力のときは undefined として submit される', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    const { container } = render(<TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />);
    const q = within(container);

    await user.type(q.getByTestId('title-input'), 'No assignee');
    await user.type(q.getByTestId('description-input'), 'Body text');
    await user.click(q.getByTestId('submit-button'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
  });
});
