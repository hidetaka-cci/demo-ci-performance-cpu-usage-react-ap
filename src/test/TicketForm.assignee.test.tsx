/**
 * Focused unit tests for TicketForm's assignee input handling.
 *
 * Targets the uncovered onChange handler on the assignee input (TicketForm.tsx
 * line 113) and the trim / undefined handling in handleSubmit (line 33). The
 * existing pbt suite never types into the assignee field, so this closes that
 * gap.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';
import type { TicketFormData } from '../types/ticket';

const fillRequired = (container: HTMLElement, title = 'A title', description = 'A description') => {
  const q = within(container);
  fireEvent.change(q.getByTestId('title-input'), { target: { value: title } });
  fireEvent.change(q.getByTestId('description-input'), { target: { value: description } });
};

describe('TicketForm - assignee input', () => {
  it('assignee input への入力は input.value に反映される', () => {
    const { container, unmount } = render(
      <TicketForm onSubmit={vi.fn()} onCancel={vi.fn()} />
    );
    try {
      const input = within(container).getByTestId('assignee-input') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'Alice' } });
      expect(input.value).toBe('Alice');
    } finally {
      unmount();
    }
  });

  it('assignee を入力して submit すると trim された値が onSubmit に渡される', () => {
    const onSubmit = vi.fn<(data: TicketFormData) => void>();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      fillRequired(container);
      fireEvent.change(within(container).getByTestId('assignee-input'), {
        target: { value: '  Bob  ' },
      });
      fireEvent.click(within(container).getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].assignee).toBe('Bob');
    } finally {
      unmount();
    }
  });

  it('assignee 空文字で submit すると undefined として渡される', () => {
    const onSubmit = vi.fn<(data: TicketFormData) => void>();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      fillRequired(container);
      // Explicitly leave assignee empty.
      fireEvent.click(within(container).getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });

  it('assignee 全て空白の入力は undefined にフォールバックする', () => {
    const onSubmit = vi.fn<(data: TicketFormData) => void>();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      fillRequired(container);
      fireEvent.change(within(container).getByTestId('assignee-input'), {
        target: { value: '     ' },
      });
      fireEvent.click(within(container).getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });

  it('assignee を段階的に変更しても最新の値が使われる', () => {
    const onSubmit = vi.fn<(data: TicketFormData) => void>();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      fillRequired(container);
      const input = within(container).getByTestId('assignee-input') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'Alice' } });
      fireEvent.change(input, { target: { value: 'Bob' } });
      fireEvent.change(input, { target: { value: 'Carol' } });
      expect(input.value).toBe('Carol');

      fireEvent.click(within(container).getByTestId('submit-button'));
      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].assignee).toBe('Carol');
    } finally {
      unmount();
    }
  });

  it('validate エラー時は onSubmit を呼ばず、エラーメッセージが表示される', () => {
    const onSubmit = vi.fn<(data: TicketFormData) => void>();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      // Neither required field is filled → validate returns two errors.
      fireEvent.click(within(container).getByTestId('submit-button'));

      expect(onSubmit).not.toHaveBeenCalled();
      const q = within(container);
      expect(q.getByTestId('title-error')).toBeInTheDocument();
      expect(q.getByTestId('description-error')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('title が 200 文字を超えるとエラーが表示される (境界超過ケース)', () => {
    const onSubmit = vi.fn<(data: TicketFormData) => void>();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const longTitle = 'x'.repeat(201);
      fillRequired(container, longTitle, 'valid description');
      fireEvent.click(within(container).getByTestId('submit-button'));

      expect(onSubmit).not.toHaveBeenCalled();
      const err = within(container).getByTestId('title-error');
      expect(err.textContent).toBe('Title must be 200 characters or less');
    } finally {
      unmount();
    }
  });
});
