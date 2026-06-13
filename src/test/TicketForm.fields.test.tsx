/**
 * Field-level tests for TicketForm component.
 *
 * 既存の TicketForm.pbt.test.tsx は title / description / tags 中心。
 * このファイルでは assignee 入力経路と、関連するエッジケース (空白扱い、
 * trim 結果、特殊なバリデーションパス) をカバーする。
 *
 * カバー対象:
 *   - assignee input の onChange / 反映
 *   - 空白だけの title はバリデーションエラー
 *   - 200文字超の title はエラー
 *   - assignee 空文字は submit データで undefined になる
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import { TicketForm } from '../components/TicketForm';

const NUM_RUNS = 50;

function renderForm(props: { onSubmit: ReturnType<typeof vi.fn>; onCancel: ReturnType<typeof vi.fn> }) {
  const result = render(<TicketForm {...props} />);
  const q = within(result.container);
  return { ...result, q };
}

describe('TicketForm - assignee field', () => {
  it('assignee 入力欄が初期状態で空である', () => {
    const { unmount, q } = renderForm({ onSubmit: vi.fn(), onCancel: vi.fn() });
    try {
      const input = q.getByTestId('assignee-input') as HTMLInputElement;
      expect(input.value).toBe('');
    } finally {
      unmount();
    }
  });

  it('assignee 入力欄に文字を入れると value に反映される', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 40 }).filter(s => s.trim().length > 0),
        (name) => {
          const { unmount, q } = renderForm({ onSubmit: vi.fn(), onCancel: vi.fn() });
          try {
            const input = q.getByTestId('assignee-input') as HTMLInputElement;
            fireEvent.change(input, { target: { value: name } });
            expect(input.value).toBe(name);
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: NUM_RUNS }
    );
  });

  it('assignee を入力して submit すると trim 済みの値が onSubmit に渡される', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0),
        (rawAssignee) => {
          const onSubmit = vi.fn();
          const { unmount, q } = renderForm({ onSubmit, onCancel: vi.fn() });
          try {
            fireEvent.change(q.getByTestId('title-input'), { target: { value: 'title' } });
            fireEvent.change(q.getByTestId('description-input'), { target: { value: 'desc' } });
            // 前後に空白を付加して、trim が効くことを確認
            fireEvent.change(q.getByTestId('assignee-input'), { target: { value: `  ${rawAssignee}  ` } });
            fireEvent.click(q.getByTestId('submit-button'));

            expect(onSubmit).toHaveBeenCalledOnce();
            const submitted = onSubmit.mock.calls[0][0];
            expect(submitted.assignee).toBe(rawAssignee.trim());
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: NUM_RUNS }
    );
  });

  it('assignee 未入力で submit すると assignee は undefined になる', () => {
    const onSubmit = vi.fn();
    const { unmount, q } = renderForm({ onSubmit, onCancel: vi.fn() });
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'desc' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledOnce();
      const submitted = onSubmit.mock.calls[0][0];
      expect(submitted.assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });

  it('assignee に空白のみを入れると submit データでは undefined になる', () => {
    const onSubmit = vi.fn();
    const { unmount, q } = renderForm({ onSubmit, onCancel: vi.fn() });
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'desc' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '     ' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledOnce();
      const submitted = onSubmit.mock.calls[0][0];
      expect(submitted.assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });
});

describe('TicketForm - title validation edge cases', () => {
  it('空白のみの title は title-error を出して onSubmit を呼ばない', () => {
    const onSubmit = vi.fn();
    const { unmount, q } = renderForm({ onSubmit, onCancel: vi.fn() });
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: '     ' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'desc' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(q.getByTestId('title-error')).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    } finally {
      unmount();
    }
  });

  it('201文字以上の title は length エラーになり onSubmit を呼ばない', () => {
    const onSubmit = vi.fn();
    const { unmount, q } = renderForm({ onSubmit, onCancel: vi.fn() });
    try {
      const longTitle = 'a'.repeat(201);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: longTitle } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'desc' } });
      fireEvent.click(q.getByTestId('submit-button'));

      const errEl = q.getByTestId('title-error');
      expect(errEl).toBeInTheDocument();
      expect(errEl.textContent).toMatch(/200/);
      expect(onSubmit).not.toHaveBeenCalled();
    } finally {
      unmount();
    }
  });

  it('200文字ちょうどの title は通過する', () => {
    const onSubmit = vi.fn();
    const { unmount, q } = renderForm({ onSubmit, onCancel: vi.fn() });
    try {
      const title = 'a'.repeat(200);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: title } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'desc' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledOnce();
      expect(onSubmit.mock.calls[0][0].title).toBe(title);
    } finally {
      unmount();
    }
  });
});
