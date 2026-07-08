/**
 * Coverage-focused tests for TicketForm assignee input (line 113) and
 * remaining validation branches not exercised by the existing PBT suite.
 *
 * - assignee input onChange handler (line 113)
 * - Title-too-long error branch (validate() の 200 文字超過分岐)
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import { TicketForm } from '../components/TicketForm';

const NUM_RUNS = 30;

describe('TicketForm - assignee input properties', () => {
  it('assignee input への入力が state に反映される', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0),
        (assignee) => {
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
        }
      ),
      { numRuns: NUM_RUNS }
    );
  });

  it('assignee を入力すると submit 時のデータに含まれる (trim される)', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
        (rawAssignee) => {
          const onSubmit = vi.fn();
          const { unmount, container } = render(
            <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
          );
          try {
            const q = within(container);
            fireEvent.change(q.getByTestId('title-input'), { target: { value: 'valid title' } });
            fireEvent.change(q.getByTestId('description-input'), { target: { value: 'valid desc' } });
            const padded = `  ${rawAssignee}  `;
            fireEvent.change(q.getByTestId('assignee-input'), { target: { value: padded } });
            fireEvent.click(q.getByTestId('submit-button'));

            expect(onSubmit).toHaveBeenCalledOnce();
            const submitted = onSubmit.mock.calls[0][0];
            expect(submitted.assignee).toBe(rawAssignee.trim());
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: NUM_RUNS }
    );
  });

  it('assignee が空文字のみの場合は submit データで undefined になる', () => {
    const onSubmit = vi.fn();
    const { unmount, container } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'valid title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'valid desc' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '   ' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledOnce();
      const submitted = onSubmit.mock.calls[0][0];
      expect(submitted.assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });
});

describe('TicketForm - title length validation', () => {
  it('タイトルが200文字を超えるとエラーが表示され onSubmit は呼ばれない', () => {
    const onSubmit = vi.fn();
    const { unmount, container } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      const overlong = 'a'.repeat(201);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: overlong } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'valid desc' } });
      fireEvent.click(q.getByTestId('submit-button'));

      const err = q.getByTestId('title-error');
      expect(err).toBeInTheDocument();
      expect(err.textContent).toMatch(/200/);
      expect(onSubmit).not.toHaveBeenCalled();
    } finally {
      unmount();
    }
  });

  it('タイトルがちょうど200文字なら通る', () => {
    const onSubmit = vi.fn();
    const { unmount, container } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      const exact = 'a'.repeat(200);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: exact } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'valid desc' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledOnce();
    } finally {
      unmount();
    }
  });
});
