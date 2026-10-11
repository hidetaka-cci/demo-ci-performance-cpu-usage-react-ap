/**
 * Property-Based Tests for TicketForm — assignee 入力周り
 *
 * 既存の TicketForm.pbt.test.tsx がカバーしていない動線:
 *   - assignee input への入力 (TicketForm.tsx:113 の onChange)
 *   - assignee が trim された形で submit データに乗る
 *   - 空白のみの assignee は undefined として扱われる
 *   - title が 200 文字超の場合に title.length エラーが出る (validate 分岐)
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import { TicketForm } from '../components/TicketForm';

const NUM_RUNS = 100;

const validTitleArb = fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0);
const validDescArb = fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0);
const assigneeArb = fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0);

function renderForm() {
  const onSubmit = vi.fn();
  const onCancel = vi.fn();
  const result = render(<TicketForm onSubmit={onSubmit} onCancel={onCancel} />);
  return { ...result, q: within(result.container), onSubmit, onCancel };
}

describe('TicketForm - assignee input properties', () => {
  it('assignee input は常にレンダリングされる', () => {
    const { unmount, q } = renderForm();
    try {
      expect(q.getByTestId('assignee-input')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('assignee input に入力するとその値が input.value に反映される', () => {
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

  it('assignee を入力して submit すると trim された値が onSubmit に渡る', () => {
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

  it('空白のみの assignee は undefined として扱われる', () => {
    fc.assert(
      fc.property(
        validTitleArb,
        validDescArb,
        fc.stringMatching(/^[ \t]{0,10}$/),
        (title, desc, assignee) => {
          const { unmount, q, onSubmit } = renderForm();
          try {
            fireEvent.change(q.getByTestId('title-input'), { target: { value: title } });
            fireEvent.change(q.getByTestId('description-input'), { target: { value: desc } });
            fireEvent.change(q.getByTestId('assignee-input'), { target: { value: assignee } });
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

describe('TicketForm - title length validation', () => {
  it('title が 200 文字超だとエラーが表示され onSubmit は呼ばれない', () => {
    // title.trim().length > 200 のパス (TicketForm.tsx:20) をカバー
    fc.assert(
      fc.property(
        fc.string({ minLength: 201, maxLength: 400 }).filter(s => s.trim().length > 200),
        validDescArb,
        (longTitle, desc) => {
          const { unmount, q, onSubmit } = renderForm();
          try {
            fireEvent.change(q.getByTestId('title-input'), { target: { value: longTitle } });
            fireEvent.change(q.getByTestId('description-input'), { target: { value: desc } });
            fireEvent.click(q.getByTestId('submit-button'));

            expect(q.getByTestId('title-error').textContent).toMatch(/200 characters or less/);
            expect(onSubmit).not.toHaveBeenCalled();
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 20 }
    );
  });
});
