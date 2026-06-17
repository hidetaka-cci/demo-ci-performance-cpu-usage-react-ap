/**
 * Property-Based Tests for TicketForm - assignee field.
 *
 * Covers the previously untested assignee onChange handler (line 113) and the
 * assignee normalization branch in handleSubmit (empty / whitespace assignee
 * collapses to undefined).
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import { TicketForm } from '../components/TicketForm';

const NUM_RUNS = 30;

const validTitleArb = fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0);
const validDescArb = fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0);
const validAssigneeArb = fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0);
// Whitespace-only string (collapses to undefined after trim)
const whitespaceAssigneeArb = fc
  .array(fc.constantFrom(' ', '\t'), { minLength: 1, maxLength: 5 })
  .map(chars => chars.join(''));

describe('TicketForm - assignee properties', () => {
  it('assignee 入力時に input の value が更新される', () => {
    fc.assert(
      fc.property(validAssigneeArb, (assignee) => {
        const { unmount, container } = render(
          <TicketForm onSubmit={vi.fn()} onCancel={vi.fn()} />
        );
        try {
          const q = within(container);
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

  it('assignee を入力して submit すると trim 済み assignee が渡される', () => {
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

  it('空白だけの assignee を入力して submit すると undefined として渡される', () => {
    fc.assert(
      fc.property(validTitleArb, validDescArb, whitespaceAssigneeArb, (title, desc, ws) => {
        const onSubmit = vi.fn();
        const { unmount, container } = render(
          <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
        );
        try {
          const q = within(container);
          fireEvent.change(q.getByTestId('title-input'), { target: { value: title } });
          fireEvent.change(q.getByTestId('description-input'), { target: { value: desc } });
          fireEvent.change(q.getByTestId('assignee-input'), { target: { value: ws } });
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

  it('assignee 未入力で submit すると undefined として渡される', () => {
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
});
