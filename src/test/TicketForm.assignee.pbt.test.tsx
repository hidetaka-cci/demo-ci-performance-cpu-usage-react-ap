/**
 * Property-Based Tests for TicketForm assignee field
 *
 * カバレッジ穴: TicketForm.tsx line 113
 * `onChange={e => setAssignee(e.target.value)}` は既存テストで発火されない。
 * assignee を実際に入力し、submit ペイロードに反映されるかを検証する。
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import { TicketForm } from '../components/TicketForm';

const NUM_RUNS = 200;

const nonEmptyTextArb = fc
  .string({ minLength: 1, maxLength: 50 })
  .filter(s => s.trim().length > 0);

const paddedAssigneeArb = fc
  .string({ minLength: 1, maxLength: 30 })
  .filter(s => s.trim().length > 0)
  .map(s => `   ${s}   `);

describe('TicketForm - assignee input properties', () => {
  it('assignee 入力の value は入力文字列を反映する', () => {
    fc.assert(
      fc.property(nonEmptyTextArb, (assignee) => {
        const { unmount, container } = render(
          <TicketForm onSubmit={vi.fn()} onCancel={vi.fn()} />
        );
        try {
          const q = within(container);
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

  it('入力された assignee は submit ペイロードに trim されて含まれる', () => {
    fc.assert(
      fc.property(nonEmptyTextArb, nonEmptyTextArb, nonEmptyTextArb, (title, desc, assignee) => {
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

          expect(onSubmit).toHaveBeenCalledTimes(1);
          const payload = onSubmit.mock.calls[0][0];
          expect(payload.assignee).toBe(assignee.trim());
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('前後空白付きの assignee は trim されて渡される', () => {
    fc.assert(
      fc.property(nonEmptyTextArb, nonEmptyTextArb, paddedAssigneeArb, (title, desc, padded) => {
        const onSubmit = vi.fn();
        const { unmount, container } = render(
          <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
        );
        try {
          const q = within(container);
          fireEvent.change(q.getByTestId('title-input'), { target: { value: title } });
          fireEvent.change(q.getByTestId('description-input'), { target: { value: desc } });
          fireEvent.change(q.getByTestId('assignee-input'), { target: { value: padded } });
          fireEvent.click(q.getByTestId('submit-button'));

          expect(onSubmit).toHaveBeenCalledTimes(1);
          expect(onSubmit.mock.calls[0][0].assignee).toBe(padded.trim());
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('assignee が空文字の場合は submit ペイロードで undefined になる', () => {
    fc.assert(
      fc.property(nonEmptyTextArb, nonEmptyTextArb, (title, desc) => {
        const onSubmit = vi.fn();
        const { unmount, container } = render(
          <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
        );
        try {
          const q = within(container);
          fireEvent.change(q.getByTestId('title-input'), { target: { value: title } });
          fireEvent.change(q.getByTestId('description-input'), { target: { value: desc } });
          // assignee を敢えて空文字に設定して onChange を発火
          fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '' } });
          fireEvent.click(q.getByTestId('submit-button'));

          expect(onSubmit).toHaveBeenCalledTimes(1);
          expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });
});
