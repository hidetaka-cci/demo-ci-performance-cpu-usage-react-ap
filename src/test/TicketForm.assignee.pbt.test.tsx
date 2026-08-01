/**
 * TicketForm assignee 入力欄のテスト。
 *
 * 既存の TicketForm.pbt.test.tsx は assignee-input への onChange
 * (TicketForm.tsx:113) をテストしていなかったため未カバレッジだった。
 * このファイルは assignee 入力状態が submit 時のペイロードに正しく反映されることを検証する。
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import { TicketForm } from '../components/TicketForm';

const NUM_RUNS = 100;

const validTitleArb = fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0);
const validDescArb = fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0);
const assigneeArb = fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0);

describe('TicketForm - assignee input properties', () => {
  it('assignee 入力欄への入力値が submit ペイロードに反映される (trim 済み)', () => {
    fc.assert(
      fc.property(validTitleArb, validDescArb, assigneeArb, (title, desc, assignee) => {
        const onSubmit = vi.fn();
        const { unmount, container } = render(
          <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
        );
        try {
          const q = within(container);
          fireEvent.change(q.getByTestId('title-input'), { target: { value: title } });
          fireEvent.change(q.getByTestId('description-input'), { target: { value: desc } });
          fireEvent.change(q.getByTestId('assignee-input'), { target: { value: assignee } });
          fireEvent.click(q.getByTestId('submit-button'));

          expect(onSubmit).toHaveBeenCalledTimes(1);
          const payload = onSubmit.mock.calls[0][0];
          expect(payload.assignee).toBe(assignee.trim());
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('assignee が空文字のときは submit ペイロードで undefined になる', () => {
    fc.assert(
      fc.property(validTitleArb, validDescArb, (title, desc) => {
        const onSubmit = vi.fn();
        const { unmount, container } = render(
          <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
        );
        try {
          const q = within(container);
          fireEvent.change(q.getByTestId('title-input'), { target: { value: title } });
          fireEvent.change(q.getByTestId('description-input'), { target: { value: desc } });
          // assignee には触らない (デフォルト: 空文字)
          fireEvent.click(q.getByTestId('submit-button'));

          expect(onSubmit).toHaveBeenCalledTimes(1);
          expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('assignee 入力欄に空白のみ入力すると undefined として submit される', () => {
    fc.assert(
      fc.property(
        validTitleArb,
        validDescArb,
        fc.stringMatching(/^[ \t]{1,10}$/),
        (title, desc, whitespace) => {
          const onSubmit = vi.fn();
          const { unmount, container } = render(
            <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
          );
          try {
            const q = within(container);
            fireEvent.change(q.getByTestId('title-input'), { target: { value: title } });
            fireEvent.change(q.getByTestId('description-input'), { target: { value: desc } });
            fireEvent.change(q.getByTestId('assignee-input'), { target: { value: whitespace } });
            fireEvent.click(q.getByTestId('submit-button'));

            expect(onSubmit).toHaveBeenCalledTimes(1);
            expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: NUM_RUNS }
    );
  });

  it('assignee 入力欄への入力は controlled input として state を反映する', () => {
    fc.assert(
      fc.property(assigneeArb, (value) => {
        const { unmount, container } = render(
          <TicketForm onSubmit={vi.fn()} onCancel={vi.fn()} />
        );
        try {
          const input = within(container).getByTestId('assignee-input') as HTMLInputElement;
          expect(input.value).toBe('');
          fireEvent.change(input, { target: { value } });
          expect(input.value).toBe(value);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });
});
