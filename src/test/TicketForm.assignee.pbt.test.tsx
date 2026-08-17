/**
 * Property-Based Tests for TicketForm assignee input
 *
 * Covers TicketForm.tsx line 113 (assignee onChange handler) which was
 * previously untested, along with the submitted-data shape for the
 * optional `assignee` field:
 *   - Non-empty assignee → included in submit payload (trimmed)
 *   - Empty / whitespace-only assignee → payload.assignee is undefined
 *
 * ※ try/finally で必ず unmount し、fast-check のシュリンキング中の
 *    DOM リークを防ぎます。
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import { TicketForm } from '../components/TicketForm';

const NUM_RUNS = 100;

const validTitleArb = fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0);
const validDescArb = fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0);
const nonEmptyAssigneeArb = fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0);
// whitespace-only or empty strings should result in undefined assignee
const emptyAssigneeArb = fc.constantFrom('', ' ', '   ', '\t', '\n', '  \t  ');

function renderForm() {
  const onSubmit = vi.fn();
  const onCancel = vi.fn();
  const result = render(<TicketForm onSubmit={onSubmit} onCancel={onCancel} />);
  return { ...result, q: within(result.container), onSubmit, onCancel };
}

describe('TicketForm - assignee input properties', () => {
  it('assignee input への入力値が DOM の value に反映される', () => {
    fc.assert(
      fc.property(nonEmptyAssigneeArb, (assignee) => {
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

  it('非空の assignee は trim された値として submit データに含まれる', () => {
    fc.assert(
      fc.property(validTitleArb, validDescArb, nonEmptyAssigneeArb, (title, desc, assignee) => {
        const { unmount, q, onSubmit } = renderForm();
        try {
          fireEvent.change(q.getByTestId('title-input'), { target: { value: title } });
          fireEvent.change(q.getByTestId('description-input'), { target: { value: desc } });
          fireEvent.change(q.getByTestId('assignee-input'), { target: { value: assignee } });
          fireEvent.click(q.getByTestId('submit-button'));

          expect(onSubmit).toHaveBeenCalledOnce();
          const payload = onSubmit.mock.calls[0][0];
          expect(payload.assignee).toBe(assignee.trim());
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('空 / 空白のみの assignee は submit データで undefined になる', () => {
    fc.assert(
      fc.property(validTitleArb, validDescArb, emptyAssigneeArb, (title, desc, blank) => {
        const { unmount, q, onSubmit } = renderForm();
        try {
          fireEvent.change(q.getByTestId('title-input'), { target: { value: title } });
          fireEvent.change(q.getByTestId('description-input'), { target: { value: desc } });
          fireEvent.change(q.getByTestId('assignee-input'), { target: { value: blank } });
          fireEvent.click(q.getByTestId('submit-button'));

          expect(onSubmit).toHaveBeenCalledOnce();
          const payload = onSubmit.mock.calls[0][0];
          expect(payload.assignee).toBeUndefined();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('assignee 未入力でも submit は成功する (assignee はオプショナル)', () => {
    fc.assert(
      fc.property(validTitleArb, validDescArb, (title, desc) => {
        const { unmount, q, onSubmit } = renderForm();
        try {
          fireEvent.change(q.getByTestId('title-input'), { target: { value: title } });
          fireEvent.change(q.getByTestId('description-input'), { target: { value: desc } });
          fireEvent.click(q.getByTestId('submit-button'));

          expect(onSubmit).toHaveBeenCalledOnce();
          const payload = onSubmit.mock.calls[0][0];
          expect(payload.assignee).toBeUndefined();
          expect(q.queryByTestId('title-error')).not.toBeInTheDocument();
          expect(q.queryByTestId('description-error')).not.toBeInTheDocument();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });
});
