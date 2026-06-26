/**
 * Coverage tests for TicketForm's assignee input.
 *
 * The assignee `<input>` onChange handler (TicketForm.tsx:113) updates local state
 * and is the only branch that decides whether `assignee` is included in the submitted
 * payload (trimmed → string, otherwise undefined). Existing PBT tests never type into
 * this input, so the arrow function is at 0% coverage.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

function renderForm() {
  const onSubmit = vi.fn();
  const onCancel = vi.fn();
  const result = render(<TicketForm onSubmit={onSubmit} onCancel={onCancel} />);
  return { onSubmit, onCancel, q: within(result.container), unmount: result.unmount };
}

describe('TicketForm - assignee input', () => {
  it('assignee 入力の value が反映される', () => {
    const { q, unmount } = renderForm();
    try {
      const input = q.getByTestId('assignee-input') as HTMLInputElement;
      expect(input.value).toBe('');
      fireEvent.change(input, { target: { value: 'Alice' } });
      expect(input.value).toBe('Alice');
    } finally {
      unmount();
    }
  });

  it('assignee を入力して submit すると onSubmit に trim 済み assignee が渡る', () => {
    const { onSubmit, q, unmount } = renderForm();
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Desc' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '  Charlie  ' } });
      fireEvent.click(q.getByTestId('submit-button'));
      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].assignee).toBe('Charlie');
    } finally {
      unmount();
    }
  });

  it('assignee 空欄のまま submit すると payload.assignee は undefined', () => {
    const { onSubmit, q, unmount } = renderForm();
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Desc' } });
      fireEvent.click(q.getByTestId('submit-button'));
      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });

  it('assignee がホワイトスペースのみなら payload.assignee は undefined', () => {
    const { onSubmit, q, unmount } = renderForm();
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Desc' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '   ' } });
      fireEvent.click(q.getByTestId('submit-button'));
      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });

  it('assignee 入力を複数回変更しても最後の値が反映される', () => {
    const { onSubmit, q, unmount } = renderForm();
    try {
      const assignee = q.getByTestId('assignee-input') as HTMLInputElement;
      fireEvent.change(assignee, { target: { value: 'first' } });
      fireEvent.change(assignee, { target: { value: 'second' } });
      fireEvent.change(assignee, { target: { value: 'final' } });
      expect(assignee.value).toBe('final');

      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Desc' } });
      fireEvent.click(q.getByTestId('submit-button'));
      expect(onSubmit.mock.calls[0][0].assignee).toBe('final');
    } finally {
      unmount();
    }
  });

  it('200文字超のタイトルは長さ制限エラーになる (TicketForm.tsx:20 ブランチ)', () => {
    const { onSubmit, q, unmount } = renderForm();
    try {
      const longTitle = 'a'.repeat(201);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: longTitle } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Desc' } });
      fireEvent.click(q.getByTestId('submit-button'));
      const err = q.getByTestId('title-error');
      expect(err.textContent).toBe('Title must be 200 characters or less');
      expect(onSubmit).not.toHaveBeenCalled();
    } finally {
      unmount();
    }
  });
});
