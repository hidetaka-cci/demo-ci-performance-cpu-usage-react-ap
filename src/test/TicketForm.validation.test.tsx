/**
 * Additional validation tests for TicketForm
 *
 * Covers the title-too-long validation path not reached by TicketForm.pbt.test.tsx
 * (TicketForm.tsx line 113: title.trim().length > 200).
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import { TicketForm } from '../components/TicketForm';

const NUM_RUNS = 100;

const validDescArb = fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0);

// ── Title length validation (line 113) ─────────────────────────────────────────

describe('TicketForm - title length validation', () => {
  it('201文字以上のタイトルを送信するとエラーが表示される', () => {
    fc.assert(
      fc.property(
        // Generate a title that is definitely > 200 chars when trimmed
        fc.string({ minLength: 201, maxLength: 300 }).filter(s => s.trim().length > 200),
        validDescArb,
        (longTitle, desc) => {
          const onSubmit = vi.fn();
          const { unmount, container } = render(
            <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
          );
          try {
            const q = within(container);
            fireEvent.change(q.getByTestId('title-input'), { target: { value: longTitle } });
            fireEvent.change(q.getByTestId('description-input'), { target: { value: desc } });
            fireEvent.click(q.getByTestId('submit-button'));
            expect(q.getByTestId('title-error')).toBeInTheDocument();
            expect(q.getByTestId('title-error').textContent).toMatch(/200/);
            expect(onSubmit).not.toHaveBeenCalled();
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: NUM_RUNS }
    );
  });

  it('ちょうど200文字のタイトルはバリデーションを通過する', () => {
    const title200 = 'a'.repeat(200);
    const onSubmit = vi.fn();
    const { unmount, container } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    const q = within(container);
    fireEvent.change(q.getByTestId('title-input'), { target: { value: title200 } });
    fireEvent.change(q.getByTestId('description-input'), { target: { value: 'some description' } });
    fireEvent.click(q.getByTestId('submit-button'));
    expect(q.queryByTestId('title-error')).not.toBeInTheDocument();
    expect(onSubmit).toHaveBeenCalledOnce();
    unmount();
  });

  it('199文字のタイトルはバリデーションを通過する', () => {
    const title199 = 'b'.repeat(199);
    const onSubmit = vi.fn();
    const { unmount, container } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    const q = within(container);
    fireEvent.change(q.getByTestId('title-input'), { target: { value: title199 } });
    fireEvent.change(q.getByTestId('description-input'), { target: { value: 'some description' } });
    fireEvent.click(q.getByTestId('submit-button'));
    expect(q.queryByTestId('title-error')).not.toBeInTheDocument();
    expect(onSubmit).toHaveBeenCalledOnce();
    unmount();
  });
});

// ── Assignee field ─────────────────────────────────────────────────────────────

describe('TicketForm - assignee field', () => {
  it('assignee 入力値がsubmitデータに含まれる', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
        (title, desc, assignee) => {
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
            if (onSubmit.mock.calls.length > 0) {
              const submitted = onSubmit.mock.calls[0][0];
              expect(submitted.assignee).toBe(assignee.trim());
            }
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: NUM_RUNS }
    );
  });

  it('空の assignee は undefined として送信される', () => {
    const onSubmit = vi.fn();
    const { unmount, container } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    const q = within(container);
    fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Test title' } });
    fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Test description' } });
    // assignee left empty
    fireEvent.click(q.getByTestId('submit-button'));
    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    unmount();
  });
});
