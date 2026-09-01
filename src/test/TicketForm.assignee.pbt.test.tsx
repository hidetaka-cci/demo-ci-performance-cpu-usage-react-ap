/**
 * Property-Based Tests for TicketForm assignee input.
 *
 * カバレッジ対象:
 *   - TicketForm.tsx assignee input onChange (line 113)
 *   - assignee.trim() → undefined フォールバック分岐 (line 33 の `|| undefined`)
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import { TicketForm } from '../components/TicketForm';

const NUM_RUNS = 100;

const nonBlankString = (max: number) =>
  fc.string({ minLength: 1, maxLength: max }).filter(s => s.trim().length > 0);

describe('TicketForm - assignee input properties', () => {
  it('assignee 入力後 submit すると trim された assignee が渡される', () => {
    fc.assert(
      fc.property(
        nonBlankString(50),
        nonBlankString(100),
        nonBlankString(30),
        (title, desc, assignee) => {
          const onSubmit = vi.fn();
          const { unmount, container } = render(
            <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
          );
          try {
            const q = within(container);
            fireEvent.change(q.getByTestId('title-input'), { target: { value: title } });
            fireEvent.change(q.getByTestId('description-input'), { target: { value: desc } });
            // 前後空白を混ぜて trim を確認
            fireEvent.change(q.getByTestId('assignee-input'), {
              target: { value: `  ${assignee}  ` },
            });
            fireEvent.click(q.getByTestId('submit-button'));

            expect(onSubmit).toHaveBeenCalledTimes(1);
            const submitted = onSubmit.mock.calls[0][0];
            expect(submitted.assignee).toBe(assignee.trim());
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: NUM_RUNS }
    );
  });

  it('assignee input の value は入力値と一致する (制御コンポーネント確認)', () => {
    fc.assert(
      fc.property(fc.string({ maxLength: 40 }), (value) => {
        const { unmount, container } = render(
          <TicketForm onSubmit={vi.fn()} onCancel={vi.fn()} />
        );
        try {
          const input = within(container).getByTestId('assignee-input') as HTMLInputElement;
          fireEvent.change(input, { target: { value } });
          expect(input.value).toBe(value);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('assignee が空文字で submit すると undefined が渡される', () => {
    fc.assert(
      fc.property(nonBlankString(50), nonBlankString(100), (title, desc) => {
        const onSubmit = vi.fn();
        const { unmount, container } = render(
          <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
        );
        try {
          const q = within(container);
          fireEvent.change(q.getByTestId('title-input'), { target: { value: title } });
          fireEvent.change(q.getByTestId('description-input'), { target: { value: desc } });
          // assignee には触れない (空のまま) → undefined になるはず
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

  it('assignee が空白のみの場合も undefined として送信される', () => {
    fc.assert(
      fc.property(
        nonBlankString(50),
        nonBlankString(100),
        fc.constantFrom(' ', '   ', '\t', '\t  \t', '  \n  '),
        (title, desc, whitespace) => {
          const onSubmit = vi.fn();
          const { unmount, container } = render(
            <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
          );
          try {
            const q = within(container);
            fireEvent.change(q.getByTestId('title-input'), { target: { value: title } });
            fireEvent.change(q.getByTestId('description-input'), { target: { value: desc } });
            fireEvent.change(q.getByTestId('assignee-input'), {
              target: { value: whitespace },
            });
            fireEvent.click(q.getByTestId('submit-button'));

            expect(onSubmit).toHaveBeenCalledTimes(1);
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

  it('assignee 変更は title/description のバリデーションを走らせない', () => {
    fc.assert(
      fc.property(fc.string({ maxLength: 30 }), (value) => {
        const { unmount, container } = render(
          <TicketForm onSubmit={vi.fn()} onCancel={vi.fn()} />
        );
        try {
          const q = within(container);
          // title/description は空のまま assignee にだけ入力
          fireEvent.change(q.getByTestId('assignee-input'), { target: { value } });
          // submit していないのでエラー表示は無いはず
          expect(q.queryByTestId('title-error')).not.toBeInTheDocument();
          expect(q.queryByTestId('description-error')).not.toBeInTheDocument();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });
});
