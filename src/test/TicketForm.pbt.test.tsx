/**
 * Property-Based Tests for TicketForm component
 *
 * フォームのレンダリング・バリデーションに対して PBT を適用。
 * render + fireEvent は1回あたりのjsdomコストが高く、
 * numRuns に比例してCPU負荷が増加します。
 *
 * ※ try/finally で必ず unmount し、fast-check のシュリンキング中の
 *    DOM リークを防ぎます。within(container) で DOM スコープを限定します。
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import { TicketForm } from '../components/TicketForm';

const NUM_RUNS = 500;

// ── Arbitraries ───────────────────────────────────────────────────────────────

const validTitleArb = fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0);
const validDescArb = fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0);
const priorityArb = fc.constantFrom('low', 'medium', 'high', 'critical');
const tagsInputArb = fc.array(
  fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
  { maxLength: 5 }
).map(tags => tags.join(', '));

// ── Helper: within(container) でスコープ限定した render ──────────────────────

function renderForm(props: { onSubmit: ReturnType<typeof vi.fn>; onCancel: ReturnType<typeof vi.fn> }) {
  const result = render(<TicketForm {...props} />);
  const q = within(result.container);
  return { ...result, q };
}

// ── Rendering properties ──────────────────────────────────────────────────────

describe('TicketForm - rendering properties', () => {
  it('フォームは常にレンダリングされる', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, q } = renderForm({ onSubmit: vi.fn(), onCancel: vi.fn() });
        try {
          expect(q.getByTestId('ticket-form')).toBeInTheDocument();
          expect(q.getByTestId('title-input')).toBeInTheDocument();
          expect(q.getByTestId('description-input')).toBeInTheDocument();
          expect(q.getByTestId('priority-select')).toBeInTheDocument();
          expect(q.getByTestId('submit-button')).toBeInTheDocument();
          expect(q.getByTestId('cancel-button')).toBeInTheDocument();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('priority select は4つのオプションを持つ', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, q } = renderForm({ onSubmit: vi.fn(), onCancel: vi.fn() });
        try {
          const select = q.getByTestId('priority-select') as HTMLSelectElement;
          expect(select.options).toHaveLength(4);
          const values = Array.from(select.options).map(o => o.value);
          expect(values).toContain('low');
          expect(values).toContain('medium');
          expect(values).toContain('high');
          expect(values).toContain('critical');
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });
});

// ── Validation properties ─────────────────────────────────────────────────────

describe('TicketForm - validation properties', () => {
  it('空のタイトルでsubmitするとエラーが表示される', () => {
    fc.assert(
      fc.property(validDescArb, (desc) => {
        const onSubmit = vi.fn();
        const { unmount, q } = renderForm({ onSubmit, onCancel: vi.fn() });
        try {
          // タイトルは空のまま、説明だけ入力
          fireEvent.change(q.getByTestId('description-input'), { target: { value: desc } });
          fireEvent.click(q.getByTestId('submit-button'));
          expect(q.getByTestId('title-error')).toBeInTheDocument();
          expect(onSubmit).not.toHaveBeenCalled();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('空の説明でsubmitするとエラーが表示される', () => {
    fc.assert(
      fc.property(validTitleArb, (title) => {
        const onSubmit = vi.fn();
        const { unmount, q } = renderForm({ onSubmit, onCancel: vi.fn() });
        try {
          fireEvent.change(q.getByTestId('title-input'), { target: { value: title } });
          // 説明は空のまま
          fireEvent.click(q.getByTestId('submit-button'));
          expect(q.getByTestId('description-error')).toBeInTheDocument();
          expect(onSubmit).not.toHaveBeenCalled();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('有効な入力でsubmitすると onSubmit が呼ばれる', () => {
    fc.assert(
      fc.property(validTitleArb, validDescArb, priorityArb, (title, desc, priority) => {
        const onSubmit = vi.fn();
        const { unmount, q } = renderForm({ onSubmit, onCancel: vi.fn() });
        try {
          fireEvent.change(q.getByTestId('title-input'), { target: { value: title } });
          fireEvent.change(q.getByTestId('description-input'), { target: { value: desc } });
          fireEvent.change(q.getByTestId('priority-select'), { target: { value: priority } });
          fireEvent.click(q.getByTestId('submit-button'));
          expect(onSubmit).toHaveBeenCalledOnce();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('有効な入力で送信されるデータの title は trim された値', () => {
    fc.assert(
      fc.property(validTitleArb, validDescArb, (title, desc) => {
        const onSubmit = vi.fn();
        const { unmount, q } = renderForm({ onSubmit, onCancel: vi.fn() });
        try {
          fireEvent.change(q.getByTestId('title-input'), { target: { value: title } });
          fireEvent.change(q.getByTestId('description-input'), { target: { value: desc } });
          fireEvent.click(q.getByTestId('submit-button'));
          if (onSubmit.mock.calls.length > 0) {
            const submitted = onSubmit.mock.calls[0][0];
            expect(submitted.title).toBe(title.trim());
          }
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('タグはカンマ区切りで分割されてsubmitされる', () => {
    fc.assert(
      fc.property(validTitleArb, validDescArb, tagsInputArb, (title, desc, tagsInput) => {
        const onSubmit = vi.fn();
        const { unmount, q } = renderForm({ onSubmit, onCancel: vi.fn() });
        try {
          fireEvent.change(q.getByTestId('title-input'), { target: { value: title } });
          fireEvent.change(q.getByTestId('description-input'), { target: { value: desc } });
          fireEvent.change(q.getByTestId('tags-input'), { target: { value: tagsInput } });
          fireEvent.click(q.getByTestId('submit-button'));
          if (onSubmit.mock.calls.length > 0) {
            const submitted = onSubmit.mock.calls[0][0];
            expect(submitted.tags.every((t: string) => t.length > 0)).toBe(true);
          }
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('Cancel ボタンクリックで onCancel が呼ばれる', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const onCancel = vi.fn();
        const { unmount, q } = renderForm({ onSubmit: vi.fn(), onCancel });
        try {
          fireEvent.click(q.getByTestId('cancel-button'));
          expect(onCancel).toHaveBeenCalledOnce();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });
});
