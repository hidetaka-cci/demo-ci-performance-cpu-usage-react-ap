/**
 * Tests for TicketForm - assignee input and title length validation
 *
 * Covers previously untested paths in TicketForm.tsx:
 *   - Line 113: onChange={e => setAssignee(e.target.value)} — assignee input handler
 *     (existing tests never interact with the assignee field)
 *   - Line 20 branch: if (title.trim().length > 200) — title too long validation
 *     (existing tests use maxLength: 200 so this branch is never reached)
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

function renderForm(onSubmit = vi.fn(), onCancel = vi.fn()) {
  const result = render(<TicketForm onSubmit={onSubmit} onCancel={onCancel} />);
  const q = within(result.container);
  return { ...result, q };
}

describe('TicketForm - assignee input', () => {
  it('assignee を入力して送信するとデータに assignee が含まれる', () => {
    const onSubmit = vi.fn();
    const { q, unmount } = renderForm(onSubmit);
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Valid title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Valid description' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: 'Bob' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledOnce();
      expect(onSubmit.mock.calls[0][0].assignee).toBe('Bob');
    } finally {
      unmount();
    }
  });

  it('assignee が空白のみの場合 undefined として送信される', () => {
    const onSubmit = vi.fn();
    const { q, unmount } = renderForm(onSubmit);
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Valid title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Valid description' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '   ' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledOnce();
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });

  it('assignee を変更後にクリアしても問題なく送信できる', () => {
    const onSubmit = vi.fn();
    const { q, unmount } = renderForm(onSubmit);
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Valid title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Valid description' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: 'Alice' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledOnce();
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });
});

describe('TicketForm - title length validation', () => {
  it('201文字のタイトルはエラーになる', () => {
    const onSubmit = vi.fn();
    const { q, unmount } = renderForm(onSubmit);
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'a'.repeat(201) } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Some description' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(q.getByTestId('title-error').textContent).toBe('Title must be 200 characters or less');
      expect(onSubmit).not.toHaveBeenCalled();
    } finally {
      unmount();
    }
  });

  it('200文字ちょうどのタイトルはエラーにならない (境界値)', () => {
    const onSubmit = vi.fn();
    const { q, unmount } = renderForm(onSubmit);
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'a'.repeat(200) } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Some description' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(q.queryByTestId('title-error')).not.toBeInTheDocument();
      expect(onSubmit).toHaveBeenCalledOnce();
    } finally {
      unmount();
    }
  });

  it('空のタイトルは "Title is required" エラーを出す (title > 200 とは別のエラー)', () => {
    const onSubmit = vi.fn();
    const { q, unmount } = renderForm(onSubmit);
    try {
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Some description' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(q.getByTestId('title-error').textContent).toBe('Title is required');
      expect(onSubmit).not.toHaveBeenCalled();
    } finally {
      unmount();
    }
  });
});
