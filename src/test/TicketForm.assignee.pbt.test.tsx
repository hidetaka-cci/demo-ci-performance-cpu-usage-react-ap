/**
 * Property-Based Tests for TicketForm - assignee & title length
 *
 * 既存の TicketForm.pbt.test.tsx でカバーされていない
 *   - assignee 入力欄の onChange
 *   - 200文字を超える title の validation ブランチ
 *   - assignee が submit ペイロードに反映されること
 * を検証します。
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import { TicketForm } from '../components/TicketForm';

const NUM_RUNS = 100;

const validTitleArb = fc
  .string({ minLength: 1, maxLength: 200 })
  .filter(s => s.trim().length > 0 && s.trim().length <= 200);
const validDescArb = fc
  .string({ minLength: 1, maxLength: 300 })
  .filter(s => s.trim().length > 0);
const validAssigneeArb = fc
  .string({ minLength: 1, maxLength: 40 })
  .filter(s => s.trim().length > 0);
// 201〜300文字の文字列 (先頭を非空白文字にして trim 後も長さを保持する)
const longTitleArb = fc
  .string({ minLength: 200, maxLength: 300 })
  .map(s => 'A' + s)
  .filter(s => s.trim().length > 200);

function renderForm(props: {
  onSubmit: ReturnType<typeof vi.fn>;
  onCancel: ReturnType<typeof vi.fn>;
}) {
  const result = render(<TicketForm {...props} />);
  const q = within(result.container);
  return { ...result, q };
}

describe('TicketForm - assignee properties', () => {
  it('assignee 入力欄への入力がフィールドの value に反映される', () => {
    fc.assert(
      fc.property(validAssigneeArb, (assignee) => {
        const { unmount, q } = renderForm({ onSubmit: vi.fn(), onCancel: vi.fn() });
        try {
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

  it('assignee を入力してsubmitすると trim された assignee が渡される', () => {
    fc.assert(
      fc.property(validTitleArb, validDescArb, validAssigneeArb, (title, desc, assignee) => {
        const onSubmit = vi.fn();
        const { unmount, q } = renderForm({ onSubmit, onCancel: vi.fn() });
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

  it('assignee が空のままsubmitすると assignee は undefined になる', () => {
    fc.assert(
      fc.property(validTitleArb, validDescArb, (title, desc) => {
        const onSubmit = vi.fn();
        const { unmount, q } = renderForm({ onSubmit, onCancel: vi.fn() });
        try {
          fireEvent.change(q.getByTestId('title-input'), { target: { value: title } });
          fireEvent.change(q.getByTestId('description-input'), { target: { value: desc } });
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

describe('TicketForm - title length validation properties', () => {
  it('200 文字を超える title で submit すると title-error が表示される', () => {
    fc.assert(
      fc.property(longTitleArb, validDescArb, (title, desc) => {
        const onSubmit = vi.fn();
        const { unmount, q } = renderForm({ onSubmit, onCancel: vi.fn() });
        try {
          fireEvent.change(q.getByTestId('title-input'), { target: { value: title } });
          fireEvent.change(q.getByTestId('description-input'), { target: { value: desc } });
          fireEvent.click(q.getByTestId('submit-button'));

          const err = q.getByTestId('title-error');
          expect(err).toBeInTheDocument();
          expect(err.textContent).toMatch(/200 characters/);
          expect(onSubmit).not.toHaveBeenCalled();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('200 文字ちょうどの title は有効として受理される', () => {
    fc.assert(
      fc.property(validDescArb, (desc) => {
        const onSubmit = vi.fn();
        const { unmount, q } = renderForm({ onSubmit, onCancel: vi.fn() });
        try {
          const title = 'A'.repeat(200);
          fireEvent.change(q.getByTestId('title-input'), { target: { value: title } });
          fireEvent.change(q.getByTestId('description-input'), { target: { value: desc } });
          fireEvent.click(q.getByTestId('submit-button'));

          expect(q.queryByTestId('title-error')).not.toBeInTheDocument();
          expect(onSubmit).toHaveBeenCalledTimes(1);
          expect(onSubmit.mock.calls[0][0].title).toBe(title);
        } finally {
          unmount();
        }
      }),
      { numRuns: 20 }
    );
  });
});
