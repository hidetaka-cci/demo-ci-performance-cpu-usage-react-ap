/**
 * Property-Based Tests for TicketForm's assignee input.
 *
 * The existing TicketForm tests never type into the assignee field, leaving
 * the `onChange` arrow at line 113 of TicketForm.tsx as a 0% covered
 * anonymous function. These tests exercise the assignee → submitted-data
 * pipeline, including trimming and the empty/whitespace-only → `undefined`
 * fallback.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import { TicketForm } from '../components/TicketForm';

const NUM_RUNS = 100;

const validTitleArb = fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0);
const validDescArb = fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0);
const validAssigneeArb = fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0);
const whitespaceOnlyArb = fc.array(fc.constantFrom(' ', '\t', '\n'), { minLength: 0, maxLength: 10 })
  .map(chars => chars.join(''));

function renderForm() {
  const onSubmit = vi.fn();
  const result = render(<TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />);
  const q = within(result.container);
  return { ...result, q, onSubmit };
}

describe('TicketForm - assignee input properties', () => {
  it('assignee 入力に文字を入力すると input の値が更新される', () => {
    fc.assert(
      fc.property(validAssigneeArb, (assignee) => {
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

  it('assignee を入力して submit すると trim された値が渡される', () => {
    // ラップする空白を含む assignee を生成
    const paddedAssigneeArb = fc.tuple(whitespaceOnlyArb, validAssigneeArb, whitespaceOnlyArb)
      .map(([lead, core, trail]) => lead + core + trail);

    fc.assert(
      fc.property(validTitleArb, validDescArb, paddedAssigneeArb, (title, desc, assignee) => {
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

  it('assignee が空文字または空白のみのとき、submit されたデータの assignee は undefined', () => {
    fc.assert(
      fc.property(validTitleArb, validDescArb, whitespaceOnlyArb, (title, desc, blank) => {
        const { unmount, q, onSubmit } = renderForm();
        try {
          fireEvent.change(q.getByTestId('title-input'), { target: { value: title } });
          fireEvent.change(q.getByTestId('description-input'), { target: { value: desc } });
          fireEvent.change(q.getByTestId('assignee-input'), { target: { value: blank } });
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

  it('assignee 入力の初期値は空文字である', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, q } = renderForm();
        try {
          const input = q.getByTestId('assignee-input') as HTMLInputElement;
          expect(input.value).toBe('');
        } finally {
          unmount();
        }
      }),
      { numRuns: 10 }
    );
  });
});
