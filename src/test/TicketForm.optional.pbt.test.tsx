/**
 * Coverage tests for TicketForm - optional fields and length validation
 *
 * Targets:
 *   - TicketForm.tsx line 113: `onChange={e => setAssignee(e.target.value)}`
 *     (assignee input change is not exercised by the existing pbt suite).
 *   - The `title.trim().length > 200` branch of validate() (line 20).
 *   - The assignee-optional serialization branch in handleSubmit (line 33).
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import { TicketForm } from '../components/TicketForm';

const NUM_RUNS = 30;

const validTitleArb = fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0);
const validDescArb = fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0);
const validAssigneeArb = fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0);

function renderForm(props: { onSubmit: ReturnType<typeof vi.fn>; onCancel: ReturnType<typeof vi.fn> }) {
  const result = render(<TicketForm {...props} />);
  const q = within(result.container);
  return { ...result, q };
}

describe('TicketForm - assignee field properties', () => {
  it('assignee 入力時に input の value が更新される', () => {
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

  it('assignee を入力して submit すると trim された値が渡される', () => {
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

  it('assignee が未入力の場合は submit 値が undefined になる', () => {
    fc.assert(
      fc.property(validTitleArb, validDescArb, (title, desc) => {
        const onSubmit = vi.fn();
        const { unmount, q } = renderForm({ onSubmit, onCancel: vi.fn() });
        try {
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
});

describe('TicketForm - title length validation', () => {
  it('201 文字以上のタイトルでは長さエラーが表示される', () => {
    const longTitleArb = fc.integer({ min: 201, max: 400 }).map(n => 'x'.repeat(n));
    fc.assert(
      fc.property(longTitleArb, validDescArb, (title, desc) => {
        const onSubmit = vi.fn();
        const { unmount, q } = renderForm({ onSubmit, onCancel: vi.fn() });
        try {
          fireEvent.change(q.getByTestId('title-input'), { target: { value: title } });
          fireEvent.change(q.getByTestId('description-input'), { target: { value: desc } });
          fireEvent.click(q.getByTestId('submit-button'));
          const err = q.getByTestId('title-error');
          expect(err.textContent).toMatch(/200/);
          expect(onSubmit).not.toHaveBeenCalled();
        } finally {
          unmount();
        }
      }),
      { numRuns: 10 }
    );
  });

  it('200 文字ちょうどのタイトルは受理される', () => {
    const boundaryTitle = 'a'.repeat(200);
    const onSubmit = vi.fn();
    const { unmount, q } = renderForm({ onSubmit, onCancel: vi.fn() });
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: boundaryTitle } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'valid description' } });
      fireEvent.click(q.getByTestId('submit-button'));
      expect(onSubmit).toHaveBeenCalledOnce();
    } finally {
      unmount();
    }
  });
});
