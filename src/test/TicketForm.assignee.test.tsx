/**
 * Tests for TicketForm - assignee input behavior.
 *
 * Fills a coverage gap in TicketForm.tsx: existing tests never type into the
 * assignee input, so its onChange handler is uncovered. These tests exercise
 * the assignee state transitions through the form submission path.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';
import type { TicketFormData } from '../types/ticket';

function renderForm() {
  const onSubmit = vi.fn();
  const onCancel = vi.fn();
  const result = render(<TicketForm onSubmit={onSubmit} onCancel={onCancel} />);
  return { ...result, q: within(result.container), onSubmit, onCancel };
}

describe('TicketForm - assignee field', () => {
  it('assignee 入力の値が input に反映される', () => {
    const { q } = renderForm();
    const assigneeInput = q.getByTestId('assignee-input') as HTMLInputElement;

    fireEvent.change(assigneeInput, { target: { value: 'Charlie' } });

    expect(assigneeInput.value).toBe('Charlie');
  });

  it('assignee が入力された状態で有効な submit を行うと onSubmit に assignee が trim されて渡される', () => {
    const { q, onSubmit } = renderForm();

    fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Fix bug' } });
    fireEvent.change(q.getByTestId('description-input'), {
      target: { value: 'Something is broken' },
    });
    fireEvent.change(q.getByTestId('assignee-input'), {
      target: { value: '  Dana  ' },
    });

    fireEvent.click(q.getByTestId('submit-button'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const submitted = onSubmit.mock.calls[0][0] as TicketFormData;
    expect(submitted.assignee).toBe('Dana');
  });

  it('assignee が空文字 / 空白のみの場合 onSubmit には undefined が渡される', () => {
    const { q, onSubmit } = renderForm();

    fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Title' } });
    fireEvent.change(q.getByTestId('description-input'), {
      target: { value: 'Description' },
    });
    fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '   ' } });

    fireEvent.click(q.getByTestId('submit-button'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const submitted = onSubmit.mock.calls[0][0] as TicketFormData;
    expect(submitted.assignee).toBeUndefined();
  });

  it('assignee を入力しないまま submit すると assignee は undefined', () => {
    const { q, onSubmit } = renderForm();

    fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Title' } });
    fireEvent.change(q.getByTestId('description-input'), {
      target: { value: 'Description' },
    });
    // assignee-input は意図的に変更しない
    fireEvent.click(q.getByTestId('submit-button'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const submitted = onSubmit.mock.calls[0][0] as TicketFormData;
    expect(submitted.assignee).toBeUndefined();
  });
});
