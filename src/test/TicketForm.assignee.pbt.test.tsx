/**
 * Property-Based Tests for TicketForm - assignee input
 *
 * Covers TicketForm.tsx line 113: the assignee input onChange handler.
 * Also exercises the assignee-related branch in handleSubmit
 * (`assignee: assignee?.trim() || undefined`) which was previously untouched.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import { TicketForm } from '../components/TicketForm';

const NUM_RUNS = 50;

const validTitleArb = fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0);
const validDescArb = fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0);
const nonEmptyAssigneeArb = fc
  .string({ minLength: 1, maxLength: 50 })
  .filter(s => s.trim().length > 0);
const whitespaceOnlyArb = fc.constantFrom('', '   ', '\t', '\n', '  \t  ');

describe('TicketForm - assignee input properties', () => {
  it('assignee 入力後に value が反映される', () => {
    fc.assert(
      fc.property(nonEmptyAssigneeArb, (assignee) => {
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

  it('assignee 入力ありで submit すると trim された assignee が渡される', () => {
    fc.assert(
      fc.property(validTitleArb, validDescArb, nonEmptyAssigneeArb, (title, desc, assignee) => {
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

  it('空 or 空白のみの assignee で submit すると assignee は undefined になる', () => {
    fc.assert(
      fc.property(validTitleArb, validDescArb, whitespaceOnlyArb, (title, desc, assignee) => {
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
          expect(submitted.assignee).toBeUndefined();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('assignee フィールドの初期値は空文字である', () => {
    const { unmount, container } = render(
      <TicketForm onSubmit={vi.fn()} onCancel={vi.fn()} />
    );
    try {
      const input = within(container).getByTestId('assignee-input') as HTMLInputElement;
      expect(input.value).toBe('');
    } finally {
      unmount();
    }
  });

  it('assignee 入力後に別の値へ変更するとその値が反映される', () => {
    fc.assert(
      fc.property(nonEmptyAssigneeArb, nonEmptyAssigneeArb, (first, second) => {
        const { unmount, container } = render(
          <TicketForm onSubmit={vi.fn()} onCancel={vi.fn()} />
        );
        try {
          const input = within(container).getByTestId('assignee-input') as HTMLInputElement;
          fireEvent.change(input, { target: { value: first } });
          expect(input.value).toBe(first);
          fireEvent.change(input, { target: { value: second } });
          expect(input.value).toBe(second);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });
});
