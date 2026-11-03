import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import { TicketForm } from '../components/TicketForm';

const NUM_RUNS = 100;

const validDescArb = fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0);

function renderForm() {
  const onSubmit = vi.fn();
  const onCancel = vi.fn();
  const result = render(<TicketForm onSubmit={onSubmit} onCancel={onCancel} />);
  return { ...result, onSubmit, onCancel, q: within(result.container) };
}

describe('TicketForm - title length validation', () => {
  it('201文字以上のタイトルは文字数超過エラーを表示し onSubmit は呼ばれない', () => {
    fc.assert(
      fc.property(
        // title longer than 200 chars (all non-whitespace to avoid trim issues)
        fc.string({ minLength: 201, maxLength: 300 }).filter(s => s.trim().length > 200),
        validDescArb,
        (longTitle, desc) => {
          const { unmount, q, onSubmit } = renderForm();
          try {
            fireEvent.change(q.getByTestId('title-input'), { target: { value: longTitle } });
            fireEvent.change(q.getByTestId('description-input'), { target: { value: desc } });
            fireEvent.click(q.getByTestId('submit-button'));
            expect(q.getByTestId('title-error')).toBeInTheDocument();
            expect(q.getByTestId('title-error').textContent).toMatch(/200/);
            expect(onSubmit).not.toHaveBeenCalled();
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: NUM_RUNS }
    );
  });

  it('ちょうど200文字のタイトルは有効で onSubmit が呼ばれる', () => {
    fc.assert(
      fc.property(
        validDescArb,
        (desc) => {
          const { unmount, q, onSubmit } = renderForm();
          try {
            // Exactly 200 non-whitespace characters
            const title200 = 'a'.repeat(200);
            fireEvent.change(q.getByTestId('title-input'), { target: { value: title200 } });
            fireEvent.change(q.getByTestId('description-input'), { target: { value: desc } });
            fireEvent.click(q.getByTestId('submit-button'));
            expect(q.queryByTestId('title-error')).not.toBeInTheDocument();
            expect(onSubmit).toHaveBeenCalledOnce();
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: NUM_RUNS }
    );
  });

  it('空白のみのタイトルは空欄エラーを表示する', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).map(s => ' '.repeat(s.length)),
        validDescArb,
        (whitespaceTitle, desc) => {
          const { unmount, q, onSubmit } = renderForm();
          try {
            fireEvent.change(q.getByTestId('title-input'), { target: { value: whitespaceTitle } });
            fireEvent.change(q.getByTestId('description-input'), { target: { value: desc } });
            fireEvent.click(q.getByTestId('submit-button'));
            expect(q.getByTestId('title-error')).toBeInTheDocument();
            expect(onSubmit).not.toHaveBeenCalled();
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: NUM_RUNS }
    );
  });

  it('assignee フィールドへの入力が onSubmit で送信される', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        validDescArb,
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
        (title, desc, assignee) => {
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
        }
      ),
      { numRuns: NUM_RUNS }
    );
  });
});
