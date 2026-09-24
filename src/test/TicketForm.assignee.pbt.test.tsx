/**
 * Property-Based Tests for TicketForm - assignee input & title length validation
 *
 * 既存の TicketForm テストでカバーされていない以下の経路を対象とする:
 *   - assignee input への入力が submit payload に反映される
 *   - assignee 未入力時は submit payload の assignee が undefined になる
 *   - タイトルが 200 文字を超えるとバリデーションエラー
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import { TicketForm } from '../components/TicketForm';

const NUM_RUNS = 100;

const validTitleArb = fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0);
const validDescArb = fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0);
const assigneeArb = fc.string({ minLength: 1, maxLength: 40 }).filter(s => s.trim().length > 0);
// 200 文字を確実に超えるためのタイトル(trim後の長さで判定される)
const overlongTitleArb = fc.string({ minLength: 201, maxLength: 300 }).filter(s => s.trim().length > 200);

function renderForm(props: { onSubmit: ReturnType<typeof vi.fn>; onCancel: ReturnType<typeof vi.fn> }) {
  const result = render(<TicketForm {...props} />);
  const q = within(result.container);
  return { ...result, q };
}

describe('TicketForm - assignee field', () => {
  it('assignee を入力して submit すると payload に assignee が含まれる (trimmed)', () => {
    fc.assert(
      fc.property(validTitleArb, validDescArb, assigneeArb, (title, desc, assignee) => {
        const onSubmit = vi.fn();
        const { unmount, q } = renderForm({ onSubmit, onCancel: vi.fn() });
        try {
          fireEvent.change(q.getByTestId('title-input'), { target: { value: title } });
          fireEvent.change(q.getByTestId('description-input'), { target: { value: desc } });
          fireEvent.change(q.getByTestId('assignee-input'), { target: { value: assignee } });
          fireEvent.click(q.getByTestId('submit-button'));

          expect(onSubmit).toHaveBeenCalledOnce();
          const submitted = onSubmit.mock.calls[0][0];
          expect(submitted.assignee).toBe(assignee.trim());
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('assignee 未入力のときは payload の assignee が undefined', () => {
    fc.assert(
      fc.property(validTitleArb, validDescArb, (title, desc) => {
        const onSubmit = vi.fn();
        const { unmount, q } = renderForm({ onSubmit, onCancel: vi.fn() });
        try {
          fireEvent.change(q.getByTestId('title-input'), { target: { value: title } });
          fireEvent.change(q.getByTestId('description-input'), { target: { value: desc } });
          // assignee は空のまま
          fireEvent.click(q.getByTestId('submit-button'));

          expect(onSubmit).toHaveBeenCalledOnce();
          const submitted = onSubmit.mock.calls[0][0];
          expect(submitted.assignee).toBeUndefined();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('assignee input への入力が UI 上の value にも反映される', () => {
    fc.assert(
      fc.property(assigneeArb, (assignee) => {
        const { unmount, q } = renderForm({ onSubmit: vi.fn(), onCancel: vi.fn() });
        try {
          const input = q.getByTestId('assignee-input') as HTMLInputElement;
          fireEvent.change(input, { target: { value: assignee } });
          expect(input.value).toBe(assignee);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });
});

describe('TicketForm - title length validation', () => {
  it('タイトルが 200 文字を超える場合は title-error が表示され onSubmit は呼ばれない', () => {
    fc.assert(
      fc.property(overlongTitleArb, validDescArb, (title, desc) => {
        const onSubmit = vi.fn();
        const { unmount, q } = renderForm({ onSubmit, onCancel: vi.fn() });
        try {
          fireEvent.change(q.getByTestId('title-input'), { target: { value: title } });
          fireEvent.change(q.getByTestId('description-input'), { target: { value: desc } });
          fireEvent.click(q.getByTestId('submit-button'));

          expect(q.getByTestId('title-error')).toBeInTheDocument();
          expect(onSubmit).not.toHaveBeenCalled();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });
});
