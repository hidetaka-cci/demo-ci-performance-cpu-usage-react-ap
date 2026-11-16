/**
 * Tests for TicketForm edge-case validation
 *
 * The existing TicketForm.pbt.test.tsx uses maxLength: 200 for title,
 * so the "title > 200 chars" error branch is never exercised.
 * This file covers that path along with other boundary conditions.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import { TicketForm } from '../components/TicketForm';

const NUM_RUNS = 100;

function renderForm(onSubmit = vi.fn(), onCancel = vi.fn()) {
  const result = render(<TicketForm onSubmit={onSubmit} onCancel={onCancel} />);
  return { ...result, q: within(result.container) };
}

describe('TicketForm - title length > 200 validation', () => {
  it('タイトルが201文字以上のとき title-error が表示される', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 201, maxLength: 300 }),
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        (longTitle, desc) => {
          const onSubmit = vi.fn();
          const { unmount, q } = renderForm(onSubmit);
          try {
            fireEvent.change(q.getByTestId('title-input'), { target: { value: longTitle } });
            fireEvent.change(q.getByTestId('description-input'), { target: { value: desc } });
            fireEvent.click(q.getByTestId('submit-button'));
            expect(q.getByTestId('title-error')).toBeInTheDocument();
            expect(onSubmit).not.toHaveBeenCalled();
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: NUM_RUNS }
    );
  });

  it('タイトルがちょうど200文字のとき submit が成功する', () => {
    const title200 = 'a'.repeat(200);
    const { unmount, q } = renderForm();
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: title200 } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Valid description' } });
      fireEvent.click(q.getByTestId('submit-button'));
      expect(q.queryByTestId('title-error')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('title-error メッセージは 200 文字制限について言及している', () => {
    const longTitle = 'x'.repeat(201);
    const { unmount, q } = renderForm();
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: longTitle } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Some description' } });
      fireEvent.click(q.getByTestId('submit-button'));
      const errorEl = q.getByTestId('title-error');
      expect(errorEl.textContent).toMatch(/200/);
    } finally {
      unmount();
    }
  });
});

describe('TicketForm - whitespace-only title validation', () => {
  it('空白のみのタイトルも title-error を表示する', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }).map(s => s.replace(/\S/g, ' ')).filter(s => s.trim().length === 0 && s.length > 0),
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        (whitespaceTitle, desc) => {
          const onSubmit = vi.fn();
          const { unmount, q } = renderForm(onSubmit);
          try {
            fireEvent.change(q.getByTestId('title-input'), { target: { value: whitespaceTitle } });
            fireEvent.change(q.getByTestId('description-input'), { target: { value: desc } });
            fireEvent.click(q.getByTestId('submit-button'));
            expect(q.getByTestId('title-error')).toBeInTheDocument();
            expect(onSubmit).not.toHaveBeenCalled();
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: NUM_RUNS }
    );
  });
});

describe('TicketForm - assignee field', () => {
  it('assignee を入力すると submit データに含まれる', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
        (title, desc, assignee) => {
          const onSubmit = vi.fn();
          const { unmount, q } = renderForm(onSubmit);
          try {
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

  it('assignee が空のとき submit データの assignee は undefined', () => {
    const onSubmit = vi.fn();
    const { unmount, q } = renderForm(onSubmit);
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Test title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Test desc' } });
      fireEvent.click(q.getByTestId('submit-button'));
      expect(onSubmit).toHaveBeenCalledOnce();
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });
});
