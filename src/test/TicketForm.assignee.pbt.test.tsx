/**
 * Property-Based Tests for TicketForm assignee input
 *
 * 既存の TicketForm.pbt.test.tsx が assignee 入力を扱っていないため、
 * ここで onChange / 送信データへの反映を検証します。
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import { TicketForm } from '../components/TicketForm';

const NUM_RUNS = 100;

const validTitleArb = fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0);
const validDescArb = fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0);
const assigneeArb = fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0);

function renderForm() {
  const onSubmit = vi.fn();
  const onCancel = vi.fn();
  const result = render(<TicketForm onSubmit={onSubmit} onCancel={onCancel} />);
  return { ...result, onSubmit, onCancel, q: within(result.container) };
}

describe('TicketForm - assignee input properties', () => {
  it('assignee input は初期状態で空文字', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, q } = renderForm();
        try {
          const assigneeInput = q.getByTestId('assignee-input') as HTMLInputElement;
          expect(assigneeInput.value).toBe('');
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('assignee 入力後に value が反映される', () => {
    fc.assert(
      fc.property(assigneeArb, (assignee) => {
        const { unmount, q } = renderForm();
        try {
          const assigneeInput = q.getByTestId('assignee-input') as HTMLInputElement;
          fireEvent.change(assigneeInput, { target: { value: assignee } });
          expect(assigneeInput.value).toBe(assignee);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('assignee を入力して submit すると trim された値が送信される', () => {
    fc.assert(
      fc.property(validTitleArb, validDescArb, assigneeArb, (title, desc, assignee) => {
        const { unmount, q, onSubmit } = renderForm();
        try {
          fireEvent.change(q.getByTestId('title-input'), { target: { value: title } });
          fireEvent.change(q.getByTestId('description-input'), { target: { value: desc } });
          fireEvent.change(q.getByTestId('assignee-input'), { target: { value: assignee } });
          fireEvent.click(q.getByTestId('submit-button'));

          expect(onSubmit).toHaveBeenCalledTimes(1);
          const submitted = onSubmit.mock.calls[0][0];
          expect(submitted.assignee).toBe(assignee.trim());
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('assignee を未入力で submit すると assignee は undefined', () => {
    fc.assert(
      fc.property(validTitleArb, validDescArb, (title, desc) => {
        const { unmount, q, onSubmit } = renderForm();
        try {
          fireEvent.change(q.getByTestId('title-input'), { target: { value: title } });
          fireEvent.change(q.getByTestId('description-input'), { target: { value: desc } });
          // assignee は未入力
          fireEvent.click(q.getByTestId('submit-button'));

          expect(onSubmit).toHaveBeenCalledTimes(1);
          const submitted = onSubmit.mock.calls[0][0];
          expect(submitted.assignee).toBeUndefined();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('assignee に空白のみを入れて submit すると assignee は undefined', () => {
    const whitespaceArb = fc.constantFrom('   ', '\t', '\n', '  \t\n  ');
    fc.assert(
      fc.property(validTitleArb, validDescArb, whitespaceArb, (title, desc, whitespace) => {
        const { unmount, q, onSubmit } = renderForm();
        try {
          fireEvent.change(q.getByTestId('title-input'), { target: { value: title } });
          fireEvent.change(q.getByTestId('description-input'), { target: { value: desc } });
          fireEvent.change(q.getByTestId('assignee-input'), { target: { value: whitespace } });
          fireEvent.click(q.getByTestId('submit-button'));

          expect(onSubmit).toHaveBeenCalledTimes(1);
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
