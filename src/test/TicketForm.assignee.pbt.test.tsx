/**
 * Property-Based Tests for TicketForm assignee field
 *
 * 既存の TicketForm.pbt.test.tsx は assignee 入力を一切操作していないため、
 * setAssignee の onChange と submit 時の assignee 整形ロジックが未カバーだった。
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import { TicketForm } from '../components/TicketForm';

const NUM_RUNS = 100;

const validTitleArb = fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0);
const validDescArb = fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0);
const validAssigneeArb = fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0);

function renderForm(props: { onSubmit: ReturnType<typeof vi.fn>; onCancel: ReturnType<typeof vi.fn> }) {
  const result = render(<TicketForm {...props} />);
  const q = within(result.container);
  return { ...result, q };
}

describe('TicketForm - assignee properties', () => {
  it('assignee 入力欄に入力するとその値が input.value に反映される', () => {
    fc.assert(
      fc.property(validAssigneeArb, (assignee) => {
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

  it('assignee を入力して submit すると trim された値が submit データに含まれる', () => {
    fc.assert(
      fc.property(validTitleArb, validDescArb, validAssigneeArb, (title, desc, assignee) => {
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

  it('assignee が空文字 / 空白のみのときは undefined として submit される', () => {
    const blankAssigneeArb = fc.oneof(
      fc.constant(''),
      fc.string({ maxLength: 5 }).filter(s => s.trim().length === 0)
    );
    fc.assert(
      fc.property(validTitleArb, validDescArb, blankAssigneeArb, (title, desc, assignee) => {
        const onSubmit = vi.fn();
        const { unmount, q } = renderForm({ onSubmit, onCancel: vi.fn() });
        try {
          fireEvent.change(q.getByTestId('title-input'), { target: { value: title } });
          fireEvent.change(q.getByTestId('description-input'), { target: { value: desc } });
          if (assignee.length > 0) {
            fireEvent.change(q.getByTestId('assignee-input'), { target: { value: assignee } });
          }
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
});
