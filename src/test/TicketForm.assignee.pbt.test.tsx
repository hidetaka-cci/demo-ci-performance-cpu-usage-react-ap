/**
 * Property-Based Tests for TicketForm.assignee coverage
 *
 * TicketForm.tsx line 113 (`onChange={e => setAssignee(e.target.value)}`) は
 * 通常のバリデーションテストでは実行されないため、専用の assignee 入力
 * インタラクションテストを追加する。
 *
 * ※ try/finally + within(container) で DOM リークを防止。
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import { TicketForm } from '../components/TicketForm';

const NUM_RUNS = 50;

const validTitleArb = fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0);
const validDescArb = fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0);
const assigneeArb = fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0);

function renderForm(props: { onSubmit: ReturnType<typeof vi.fn>; onCancel: ReturnType<typeof vi.fn> }) {
  const result = render(<TicketForm {...props} />);
  const q = within(result.container);
  return { ...result, q };
}

describe('TicketForm - assignee interaction', () => {
  it('assignee input への入力で value が反映される', () => {
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

  it('assignee を入力して submit すると trim された値が渡される', () => {
    // 前後に空白を付けた assignee を用意して trim を検証する
    const paddedAssigneeArb = assigneeArb.map(s => `  ${s}  `);
    fc.assert(
      fc.property(validTitleArb, validDescArb, paddedAssigneeArb, (title, desc, padded) => {
        const onSubmit = vi.fn();
        const { unmount, q } = renderForm({ onSubmit, onCancel: vi.fn() });
        try {
          fireEvent.change(q.getByTestId('title-input'), { target: { value: title } });
          fireEvent.change(q.getByTestId('description-input'), { target: { value: desc } });
          fireEvent.change(q.getByTestId('assignee-input'), { target: { value: padded } });
          fireEvent.click(q.getByTestId('submit-button'));

          expect(onSubmit).toHaveBeenCalledOnce();
          const submitted = onSubmit.mock.calls[0][0];
          expect(submitted.assignee).toBe(padded.trim());
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('assignee を入力しないで submit すると assignee は undefined', () => {
    fc.assert(
      fc.property(validTitleArb, validDescArb, (title, desc) => {
        const onSubmit = vi.fn();
        const { unmount, q } = renderForm({ onSubmit, onCancel: vi.fn() });
        try {
          fireEvent.change(q.getByTestId('title-input'), { target: { value: title } });
          fireEvent.change(q.getByTestId('description-input'), { target: { value: desc } });
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

  it('assignee が空白のみの場合は undefined として送信される', () => {
    fc.assert(
      fc.property(
        validTitleArb,
        validDescArb,
        fc.constantFrom(' ', '  ', '   ', '\t', '  \t  '),
        (title, desc, whitespace) => {
          const onSubmit = vi.fn();
          const { unmount, q } = renderForm({ onSubmit, onCancel: vi.fn() });
          try {
            fireEvent.change(q.getByTestId('title-input'), { target: { value: title } });
            fireEvent.change(q.getByTestId('description-input'), { target: { value: desc } });
            fireEvent.change(q.getByTestId('assignee-input'), { target: { value: whitespace } });
            fireEvent.click(q.getByTestId('submit-button'));

            expect(onSubmit).toHaveBeenCalledOnce();
            const submitted = onSubmit.mock.calls[0][0];
            expect(submitted.assignee).toBeUndefined();
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: NUM_RUNS }
    );
  });
});
