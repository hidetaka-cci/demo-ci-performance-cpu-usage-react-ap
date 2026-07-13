/**
 * Property-Based Tests for TicketForm - Assignee field
 *
 * 既存の TicketForm.pbt.test.tsx は assignee 入力の onChange を発火せず、
 * TicketForm.tsx L113 の setAssignee ハンドラは 0% カバレッジでした。
 * ここで assignee の入力・送信データへの反映を検証します。
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import { TicketForm } from '../components/TicketForm';

const NUM_RUNS = 50;

const validTitleArb = fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0);
const validDescArb = fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0);
const validAssigneeArb = fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0);

describe('TicketForm - assignee field', () => {
  it('assignee input への入力が value に反映される', () => {
    fc.assert(
      fc.property(validAssigneeArb, (assignee) => {
        const { unmount, container } = render(
          <TicketForm onSubmit={vi.fn()} onCancel={vi.fn()} />
        );
        try {
          const input = within(container).getByTestId('assignee-input') as HTMLInputElement;
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

  it('assignee を入力して送信すると onSubmit のデータに trim された assignee が含まれる', () => {
    fc.assert(
      fc.property(validTitleArb, validDescArb, validAssigneeArb, (title, desc, assignee) => {
        const onSubmit = vi.fn();
        const { unmount, container } = render(
          <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
        );
        try {
          const q = within(container);
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

  it('assignee を空のまま送信すると submitted.assignee は undefined', () => {
    fc.assert(
      fc.property(validTitleArb, validDescArb, (title, desc) => {
        const onSubmit = vi.fn();
        const { unmount, container } = render(
          <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
        );
        try {
          const q = within(container);
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

  it('assignee に空白のみを入力して送信すると submitted.assignee は undefined', () => {
    fc.assert(
      fc.property(
        validTitleArb,
        validDescArb,
        fc.stringMatching(/^[ \t]{1,10}$/),
        (title, desc, whitespace) => {
          const onSubmit = vi.fn();
          const { unmount, container } = render(
            <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
          );
          try {
            const q = within(container);
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
