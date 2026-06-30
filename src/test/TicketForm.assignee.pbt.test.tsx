/**
 * Property-Based Tests for TicketForm component - assignee input
 *
 * TicketForm の assignee 入力欄の onChange ハンドラ
 * (src/components/TicketForm.tsx:113) は既存テストでは触れていなかった。
 * 入力反映、trim、optional 扱い (空 → undefined) を検証する。
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import { TicketForm } from '../components/TicketForm';

const NUM_RUNS = 200;

const validTitleArb = fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0);
const validDescArb = fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0);
const assigneeArb = fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0);

function renderForm() {
  const onSubmit = vi.fn();
  const onCancel = vi.fn();
  const result = render(<TicketForm onSubmit={onSubmit} onCancel={onCancel} />);
  return { ...result, q: within(result.container), onSubmit, onCancel };
}

describe('TicketForm - assignee input behavior', () => {
  it('assignee 入力欄の value は入力した文字列を反映する', () => {
    fc.assert(
      fc.property(assigneeArb, (assignee) => {
        const { unmount, q } = renderForm();
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

  it('assignee 付き submit: onSubmit へ trim 済み assignee が渡される', () => {
    fc.assert(
      fc.property(validTitleArb, validDescArb, assigneeArb, (title, desc, assignee) => {
        const { unmount, q, onSubmit } = renderForm();
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

  it('assignee 空文字 submit: onSubmit へ undefined が渡される', () => {
    fc.assert(
      fc.property(validTitleArb, validDescArb, (title, desc) => {
        const { unmount, q, onSubmit } = renderForm();
        try {
          fireEvent.change(q.getByTestId('title-input'), { target: { value: title } });
          fireEvent.change(q.getByTestId('description-input'), { target: { value: desc } });
          // assignee は触らない (空のまま)
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

  it('assignee に空白のみを入れて submit すると undefined になる', () => {
    fc.assert(
      fc.property(
        validTitleArb,
        validDescArb,
        fc.string({ minLength: 1, maxLength: 10 }).map(s => ' '.repeat(s.length)),
        (title, desc, whitespace) => {
          const { unmount, q, onSubmit } = renderForm();
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
