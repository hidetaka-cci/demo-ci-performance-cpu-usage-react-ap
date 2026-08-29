/**
 * Additional tests for TicketForm: assignee input & tag edge cases
 *
 * Covers the assignee onChange path (TicketForm.tsx line 113) and
 * a couple of edge cases that the existing PBT suite does not exercise:
 *  - assignee whitespace is normalized to undefined
 *  - tagsInput with empty segments (",,,") drops empties
 *  - title over 200 chars triggers validation error
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

function renderForm() {
  const onSubmit = vi.fn();
  const onCancel = vi.fn();
  const result = render(<TicketForm onSubmit={onSubmit} onCancel={onCancel} />);
  const q = within(result.container);
  return { ...result, q, onSubmit, onCancel };
}

describe('TicketForm - assignee & edge cases', () => {
  it('assignee 入力を変更すると input の value が反映される', () => {
    const { q, unmount } = renderForm();
    try {
      const assignee = q.getByTestId('assignee-input') as HTMLInputElement;
      expect(assignee.value).toBe('');
      fireEvent.change(assignee, { target: { value: 'Alice' } });
      expect(assignee.value).toBe('Alice');
    } finally {
      unmount();
    }
  });

  it('assignee が入力されていると submit データに trim 済みの値が入る', () => {
    const { q, onSubmit, unmount } = renderForm();
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Some title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Some description' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '  Alice  ' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].assignee).toBe('Alice');
    } finally {
      unmount();
    }
  });

  it('assignee が空白のみの場合、submit データでは undefined になる', () => {
    const { q, onSubmit, unmount } = renderForm();
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Some title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Some description' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '     ' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });

  it('assignee が全く入力されていない場合も submit データは undefined', () => {
    const { q, onSubmit, unmount } = renderForm();
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Some title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Some description' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });

  it('カンマ区切りタグに空要素が混ざっても空文字は除外される', () => {
    const { q, onSubmit, unmount } = renderForm();
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'T' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'D' } });
      fireEvent.change(q.getByTestId('tags-input'), { target: { value: 'bug, , frontend,,urgent' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].tags).toEqual(['bug', 'frontend', 'urgent']);
    } finally {
      unmount();
    }
  });

  it('タグが全く入力されていないと tags は空配列', () => {
    const { q, onSubmit, unmount } = renderForm();
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'T' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'D' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].tags).toEqual([]);
    } finally {
      unmount();
    }
  });

  it('タイトルが 200 文字を超えるとバリデーションエラー', () => {
    const { q, onSubmit, unmount } = renderForm();
    try {
      const longTitle = 'x'.repeat(201);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: longTitle } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'D' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).not.toHaveBeenCalled();
      const err = q.getByTestId('title-error');
      expect(err.textContent).toMatch(/200/);
    } finally {
      unmount();
    }
  });

  it('タイトルがちょうど 200 文字なら submit が成功する', () => {
    const { q, onSubmit, unmount } = renderForm();
    try {
      const title = 'x'.repeat(200);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: title } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'D' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].title).toBe(title);
    } finally {
      unmount();
    }
  });

  it('priority のデフォルトは medium で、変更すれば submit データに反映される', () => {
    const { q, onSubmit, unmount } = renderForm();
    try {
      const select = q.getByTestId('priority-select') as HTMLSelectElement;
      expect(select.value).toBe('medium');
      fireEvent.change(select, { target: { value: 'high' } });
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'T' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'D' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].priority).toBe('high');
    } finally {
      unmount();
    }
  });
});
