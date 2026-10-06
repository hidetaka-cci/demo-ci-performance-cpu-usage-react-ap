/**
 * Property-Based Tests for TicketForm - assignee input
 *
 * Covers the assignee onChange handler (TicketForm.tsx:113) which was
 * previously unexercised by existing tests.
 *
 * - 入力した値が onSubmit payload の assignee に反映される
 * - 空文字入力時は assignee: undefined になる
 * - 前後空白のみは trim されて undefined になる
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import { TicketForm } from '../components/TicketForm';

const NUM_RUNS = 100;

const validTitleArb = fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0);
const validDescArb = fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0);
const nonBlankAssigneeArb = fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0);

function renderForm(props: { onSubmit: ReturnType<typeof vi.fn>; onCancel: ReturnType<typeof vi.fn> }) {
  const result = render(<TicketForm {...props} />);
  const q = within(result.container);
  return { ...result, q };
}

describe('TicketForm - assignee input properties', () => {
  it('入力した assignee は onSubmit payload に trim して渡される', () => {
    fc.assert(
      fc.property(validTitleArb, validDescArb, nonBlankAssigneeArb, (title, desc, assignee) => {
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

  it('assignee を入力しなければ payload は undefined', () => {
    fc.assert(
      fc.property(validTitleArb, validDescArb, (title, desc) => {
        const onSubmit = vi.fn();
        const { unmount, q } = renderForm({ onSubmit, onCancel: vi.fn() });
        try {
          fireEvent.change(q.getByTestId('title-input'), { target: { value: title } });
          fireEvent.change(q.getByTestId('description-input'), { target: { value: desc } });
          // assignee は未入力
          fireEvent.click(q.getByTestId('submit-button'));

          expect(onSubmit).toHaveBeenCalledOnce();
          expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('前後空白のみの assignee は undefined になる', () => {
    fc.assert(
      fc.property(
        validTitleArb,
        validDescArb,
        fc.constantFrom(' ', '  ', '\t', '\n', '  \t\n '),
        (title, desc, whitespace) => {
          const onSubmit = vi.fn();
          const { unmount, q } = renderForm({ onSubmit, onCancel: vi.fn() });
          try {
            fireEvent.change(q.getByTestId('title-input'), { target: { value: title } });
            fireEvent.change(q.getByTestId('description-input'), { target: { value: desc } });
            fireEvent.change(q.getByTestId('assignee-input'), { target: { value: whitespace } });
            fireEvent.click(q.getByTestId('submit-button'));

            expect(onSubmit).toHaveBeenCalledOnce();
            expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: NUM_RUNS }
    );
  });

  it('assignee input は controlled: 入力した値が <input value> に反映される', () => {
    fc.assert(
      fc.property(nonBlankAssigneeArb, (assignee) => {
        const { unmount, q } = renderForm({ onSubmit: vi.fn(), onCancel: vi.fn() });
        try {
          const input = q.getByTestId('assignee-input') as HTMLInputElement;
          expect(input.value).toBe('');
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
