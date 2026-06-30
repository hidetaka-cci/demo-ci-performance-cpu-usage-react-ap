/**
 * Property-Based Tests for TicketForm component - title length validation
 *
 * src/components/TicketForm.tsx:20 (`if (title.trim().length > 200) ...`) は
 * 200文字超のタイトル時のバリデーションエラーを返す分岐。
 * 既存テストは「空タイトル」「正常タイトル」しか触れていないため未カバレッジだった。
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import { TicketForm } from '../components/TicketForm';

const NUM_RUNS = 100;

const validDescArb = fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0);

// 201〜400 文字の英数字タイトル (trim 後も 200 超を保証)
const tooLongTitleArb = fc
  .integer({ min: 201, max: 400 })
  .chain(len => fc.stringMatching(new RegExp(`^[a-zA-Z0-9]{${len}}$`)));

function renderForm() {
  const onSubmit = vi.fn();
  const onCancel = vi.fn();
  const result = render(<TicketForm onSubmit={onSubmit} onCancel={onCancel} />);
  return { ...result, q: within(result.container), onSubmit, onCancel };
}

describe('TicketForm - title length validation', () => {
  it('200文字を超えるタイトルを submit するとエラーが表示され onSubmit は呼ばれない', () => {
    fc.assert(
      fc.property(tooLongTitleArb, validDescArb, (title, desc) => {
        const { unmount, q, onSubmit } = renderForm();
        try {
          fireEvent.change(q.getByTestId('title-input'), { target: { value: title } });
          fireEvent.change(q.getByTestId('description-input'), { target: { value: desc } });
          fireEvent.click(q.getByTestId('submit-button'));

          const err = q.getByTestId('title-error');
          expect(err).toBeInTheDocument();
          expect(err.textContent).toBe('Title must be 200 characters or less');
          expect(onSubmit).not.toHaveBeenCalled();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('ちょうど200文字のタイトルは受理され onSubmit が呼ばれる (境界値)', () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^[a-zA-Z0-9]{200}$/),
        validDescArb,
        (title, desc) => {
          const { unmount, q, onSubmit } = renderForm();
          try {
            fireEvent.change(q.getByTestId('title-input'), { target: { value: title } });
            fireEvent.change(q.getByTestId('description-input'), { target: { value: desc } });
            fireEvent.click(q.getByTestId('submit-button'));
            expect(onSubmit).toHaveBeenCalledOnce();
            const submitted = onSubmit.mock.calls[0][0];
            expect(submitted.title).toBe(title);
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: NUM_RUNS }
    );
  });

  it('201文字のタイトル (境界 +1) はエラーになる', () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^[a-zA-Z0-9]{201}$/),
        validDescArb,
        (title, desc) => {
          const { unmount, q, onSubmit } = renderForm();
          try {
            fireEvent.change(q.getByTestId('title-input'), { target: { value: title } });
            fireEvent.change(q.getByTestId('description-input'), { target: { value: desc } });
            fireEvent.click(q.getByTestId('submit-button'));
            expect(q.getByTestId('title-error').textContent).toBe(
              'Title must be 200 characters or less'
            );
            expect(onSubmit).not.toHaveBeenCalled();
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: NUM_RUNS }
    );
  });
});
