/**
 * Additional Property-Based Tests for TicketForm component
 *
 * 既存の TicketForm.pbt.test.tsx では assignee 入力の変更ハンドラ
 * (src/components/TicketForm.tsx:113) と title の最大長 (>200) バリデーション
 * がカバーされていない。ここでそれらを補完する。
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import { TicketForm } from '../components/TicketForm';
import type { TicketFormData } from '../types/ticket';

const NUM_RUNS = 30;

const validTitleArb = fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0);
const validDescArb = fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0);
// trim 後に 201 文字以上になる文字列を生成する(先頭に A を 201 文字入れて確実に超過)
const overLongTitleArb = fc.string({ minLength: 0, maxLength: 50 }).map(suffix => 'A'.repeat(201) + suffix);
const assigneeArb = fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0);

function renderForm(props: { onSubmit: ReturnType<typeof vi.fn>; onCancel: ReturnType<typeof vi.fn> }) {
  const result = render(<TicketForm {...props} />);
  const q = within(result.container);
  return { ...result, q };
}

describe('TicketForm - assignee input properties', () => {
  it('assignee 入力は入力値を保持する', () => {
    fc.assert(
      fc.property(assigneeArb, (name) => {
        const { unmount, q } = renderForm({ onSubmit: vi.fn(), onCancel: vi.fn() });
        try {
          const input = q.getByTestId('assignee-input') as HTMLInputElement;
          fireEvent.change(input, { target: { value: name } });
          expect(input.value).toBe(name);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('assignee 入力後に submit すると onSubmit データに trim 済み assignee が入る', () => {
    fc.assert(
      fc.property(validTitleArb, validDescArb, assigneeArb, (title, desc, assignee) => {
        const onSubmit = vi.fn();
        const { unmount, q } = renderForm({ onSubmit, onCancel: vi.fn() });
        try {
          fireEvent.change(q.getByTestId('title-input'), { target: { value: title } });
          fireEvent.change(q.getByTestId('description-input'), { target: { value: desc } });
          fireEvent.change(q.getByTestId('assignee-input'), { target: { value: `  ${assignee}  ` } });
          fireEvent.click(q.getByTestId('submit-button'));
          expect(onSubmit).toHaveBeenCalledTimes(1);
          const submitted = onSubmit.mock.calls[0][0] as TicketFormData;
          expect(submitted.assignee).toBe(assignee);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('assignee が空白のみなら送信データは undefined になる', () => {
    fc.assert(
      fc.property(validTitleArb, validDescArb, (title, desc) => {
        const onSubmit = vi.fn();
        const { unmount, q } = renderForm({ onSubmit, onCancel: vi.fn() });
        try {
          fireEvent.change(q.getByTestId('title-input'), { target: { value: title } });
          fireEvent.change(q.getByTestId('description-input'), { target: { value: desc } });
          fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '   ' } });
          fireEvent.click(q.getByTestId('submit-button'));
          expect(onSubmit).toHaveBeenCalledTimes(1);
          const submitted = onSubmit.mock.calls[0][0] as TicketFormData;
          expect(submitted.assignee).toBeUndefined();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });
});

describe('TicketForm - title max-length validation', () => {
  it('タイトルが trim 後 200 文字を超えるとエラーが表示され onSubmit は呼ばれない', () => {
    fc.assert(
      fc.property(overLongTitleArb, validDescArb, (title, desc) => {
        const onSubmit = vi.fn();
        const { unmount, q } = renderForm({ onSubmit, onCancel: vi.fn() });
        try {
          fireEvent.change(q.getByTestId('title-input'), { target: { value: title } });
          fireEvent.change(q.getByTestId('description-input'), { target: { value: desc } });
          fireEvent.click(q.getByTestId('submit-button'));
          const err = q.getByTestId('title-error');
          expect(err.textContent).toContain('200');
          expect(onSubmit).not.toHaveBeenCalled();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });
});
