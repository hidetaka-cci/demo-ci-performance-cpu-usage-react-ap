/**
 * Tests for TicketForm's assignee input.
 *
 * Targets uncovered TicketForm.tsx line 113 (assignee onChange handler).
 * The existing PBT suite never fires a change event on the assignee input,
 * so the state update and its downstream effect on onSubmit are untested.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

describe('TicketForm - assignee input', () => {
  it('assignee 入力の変更がコントロール値に反映される', () => {
    const { container } = render(
      <TicketForm onSubmit={vi.fn()} onCancel={vi.fn()} />
    );

    const assigneeInput = within(container).getByTestId('assignee-input') as HTMLInputElement;
    expect(assigneeInput.value).toBe('');

    fireEvent.change(assigneeInput, { target: { value: 'Charlie' } });

    expect(assigneeInput.value).toBe('Charlie');
  });

  it('assignee を入力して送信すると trim された assignee が渡される', () => {
    const onSubmit = vi.fn();
    const { container } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    const q = within(container);

    fireEvent.change(q.getByTestId('title-input'), { target: { value: 'A title' } });
    fireEvent.change(q.getByTestId('description-input'), { target: { value: 'A description' } });
    fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '  Charlie  ' } });
    fireEvent.click(q.getByTestId('submit-button'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      title: 'A title',
      description: 'A description',
      assignee: 'Charlie',
    });
  });

  it('assignee が空のまま送信すると assignee は undefined になる', () => {
    const onSubmit = vi.fn();
    const { container } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    const q = within(container);

    fireEvent.change(q.getByTestId('title-input'), { target: { value: 'A title' } });
    fireEvent.change(q.getByTestId('description-input'), { target: { value: 'A description' } });
    fireEvent.click(q.getByTestId('submit-button'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
  });

  it('assignee が空白のみの場合は undefined として送信される', () => {
    const onSubmit = vi.fn();
    const { container } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    const q = within(container);

    fireEvent.change(q.getByTestId('title-input'), { target: { value: 'A title' } });
    fireEvent.change(q.getByTestId('description-input'), { target: { value: 'A description' } });
    fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '   ' } });
    fireEvent.click(q.getByTestId('submit-button'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
  });
});
