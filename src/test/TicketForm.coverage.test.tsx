/**
 * Coverage-targeted tests for TicketForm.tsx
 *
 * The existing PBT suite exercises title/description/tags/priority but does
 * not change the assignee input, leaving line 113 (`onChange={e =>
 * setAssignee(e.target.value)}`) uncovered. These deterministic tests close
 * that gap and verify both the submitted payload shape (trimmed value or
 * omission when blank) and the title length-boundary error branch.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';
import type { TicketFormData } from '../types/ticket';

function renderForm() {
  const onSubmit = vi.fn<(data: TicketFormData) => void>();
  const onCancel = vi.fn();
  const result = render(<TicketForm onSubmit={onSubmit} onCancel={onCancel} />);
  return { ...result, q: within(result.container), onSubmit, onCancel };
}

function fillRequired(q: ReturnType<typeof within>) {
  fireEvent.change(q.getByTestId('title-input'), { target: { value: 'A valid title' } });
  fireEvent.change(q.getByTestId('description-input'), { target: { value: 'A valid description' } });
}

describe('TicketForm - assignee field', () => {
  it('assignee 入力の value は type した値と一致する', () => {
    const { unmount, q } = renderForm();
    try {
      const input = q.getByTestId('assignee-input') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'Alice' } });
      expect(input.value).toBe('Alice');
    } finally {
      unmount();
    }
  });

  it('assignee を入力して submit すると trim 済みの値が onSubmit に渡される', () => {
    const { unmount, q, onSubmit } = renderForm();
    try {
      fillRequired(q);
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '  Alice  ' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      const data = onSubmit.mock.calls[0][0];
      expect(data.assignee).toBe('Alice');
    } finally {
      unmount();
    }
  });

  it('assignee が空のまま submit すると assignee は undefined になる', () => {
    const { unmount, q, onSubmit } = renderForm();
    try {
      fillRequired(q);
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });

  it('assignee が空白文字のみの場合も assignee は undefined になる', () => {
    const { unmount, q, onSubmit } = renderForm();
    try {
      fillRequired(q);
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '   ' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });
});

describe('TicketForm - title length validation', () => {
  it('201 文字のタイトルを submit するとエラーが表示され onSubmit は呼ばれない', () => {
    // TicketForm.tsx:20 の `title.trim().length > 200` 分岐を踏むケース。
    const { unmount, q, onSubmit } = renderForm();
    try {
      const tooLong = 'a'.repeat(201);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: tooLong } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'ok' } });
      fireEvent.click(q.getByTestId('submit-button'));

      const err = q.getByTestId('title-error');
      expect(err).toBeInTheDocument();
      expect(err.textContent).toBe('Title must be 200 characters or less');
      expect(onSubmit).not.toHaveBeenCalled();
    } finally {
      unmount();
    }
  });

  it('ちょうど 200 文字のタイトルは受け付けられる', () => {
    const { unmount, q, onSubmit } = renderForm();
    try {
      const boundary = 'a'.repeat(200);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: boundary } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'ok' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].title).toBe(boundary);
    } finally {
      unmount();
    }
  });
});
