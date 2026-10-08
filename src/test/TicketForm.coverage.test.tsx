/**
 * Targeted unit tests for TicketForm uncovered lines.
 *
 * Covers:
 * - Line 113: assignee input `onChange` handler.
 *   (PBT suite never fills the optional assignee field, so the handler
 *   was uncovered.)
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';
import type { TicketFormData } from '../types/ticket';

describe('TicketForm - assignee input', () => {
  it('assignee を入力すると送信データに trim 済みの値が含まれる', () => {
    const onSubmit = vi.fn<(d: TicketFormData) => void>();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), {
        target: { value: 'Fix login bug' },
      });
      fireEvent.change(q.getByTestId('description-input'), {
        target: { value: 'Users cannot authenticate.' },
      });
      // 周囲の空白付きで入力して trim 経路を確認
      fireEvent.change(q.getByTestId('assignee-input'), {
        target: { value: '  Alice  ' },
      });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].assignee).toBe('Alice');
    } finally {
      unmount();
    }
  });

  it('assignee 入力の DOM 値が onChange により更新される', () => {
    const { container, unmount } = render(
      <TicketForm onSubmit={vi.fn()} onCancel={vi.fn()} />
    );
    try {
      const input = within(container).getByTestId('assignee-input') as HTMLInputElement;
      expect(input.value).toBe('');
      fireEvent.change(input, { target: { value: 'Bob' } });
      expect(input.value).toBe('Bob');
    } finally {
      unmount();
    }
  });

  it('assignee が空のまま submit すると送信データの assignee は undefined', () => {
    const onSubmit = vi.fn<(d: TicketFormData) => void>();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'T' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'D' } });
      fireEvent.click(q.getByTestId('submit-button'));
      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });
});
