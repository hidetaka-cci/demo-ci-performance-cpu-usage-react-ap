/**
 * TicketForm - title length validation tests
 *
 * 既存の TicketForm.pbt.test.tsx は maxLength:200 の有効タイトルのみを生成するため、
 * TicketForm.tsx line 20 の「タイトルが 201 文字以上の場合」のバリデーション分岐
 * (`if (title.trim().length > 200) errs.title = 'Title must be 200 characters or less'`)
 * がテストされていない。
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

function renderForm() {
  const onSubmit = vi.fn();
  const onCancel = vi.fn();
  const result = render(<TicketForm onSubmit={onSubmit} onCancel={onCancel} />);
  return { ...result, onSubmit, onCancel, q: within(result.container) };
}

describe('TicketForm - title length validation', () => {
  it('201 文字のタイトルで submit するとエラーが表示され onSubmit は呼ばれない', () => {
    const { unmount, q, onSubmit } = renderForm();
    try {
      const longTitle = 'a'.repeat(201);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: longTitle } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Valid description' } });
      fireEvent.click(q.getByTestId('submit-button'));

      const error = q.getByTestId('title-error');
      expect(error).toBeInTheDocument();
      expect(error.textContent).toBe('Title must be 200 characters or less');
      expect(onSubmit).not.toHaveBeenCalled();
    } finally {
      unmount();
    }
  });

  it('境界値 200 文字ちょうどの場合は submit に成功する', () => {
    const { unmount, q, onSubmit } = renderForm();
    try {
      const title = 'a'.repeat(200);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: title } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Valid description' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(q.queryByTestId('title-error')).not.toBeInTheDocument();
      expect(onSubmit).toHaveBeenCalledOnce();
      expect(onSubmit.mock.calls[0][0].title).toBe(title);
    } finally {
      unmount();
    }
  });

  it('trim 後に 200 文字を超える場合のみエラーになる (前後空白は長さに含まれない)', () => {
    const { unmount, q, onSubmit } = renderForm();
    try {
      // 200文字の本文 + 前後空白10文字 = 全体210文字だが trim 後は 200 文字なので valid
      const paddedTitle = '     ' + 'a'.repeat(200) + '     ';
      fireEvent.change(q.getByTestId('title-input'), { target: { value: paddedTitle } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Valid description' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(q.queryByTestId('title-error')).not.toBeInTheDocument();
      expect(onSubmit).toHaveBeenCalledOnce();
      expect(onSubmit.mock.calls[0][0].title).toBe('a'.repeat(200));
    } finally {
      unmount();
    }
  });

  it('非常に長いタイトル (1000 文字) でもエラー表示のみでクラッシュしない', () => {
    const { unmount, q, onSubmit } = renderForm();
    try {
      const veryLongTitle = 'x'.repeat(1000);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: veryLongTitle } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Valid description' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(q.getByTestId('title-error').textContent).toBe('Title must be 200 characters or less');
      expect(onSubmit).not.toHaveBeenCalled();
    } finally {
      unmount();
    }
  });
});
