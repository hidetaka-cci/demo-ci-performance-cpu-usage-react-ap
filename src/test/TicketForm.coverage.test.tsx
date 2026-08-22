/**
 * Coverage-focused tests for TicketForm.
 *
 * The assignee input's onChange handler (line 113) and the trim-to-undefined
 * behaviour for the assignee field are not exercised by the existing suite —
 * every existing property either omits the assignee or ignores it in the
 * submitted payload assertions.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

const VALID_TITLE = 'A reasonable title';
const VALID_DESC = 'A reasonable description that is long enough.';

describe('TicketForm - assignee input', () => {
  it('assignee 入力後の値が input に反映される', () => {
    const { unmount, container } = render(
      <TicketForm onSubmit={vi.fn()} onCancel={vi.fn()} />
    );
    try {
      const input = within(container).getByTestId('assignee-input') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'Charlie' } });
      expect(input.value).toBe('Charlie');
    } finally {
      unmount();
    }
  });

  it('assignee あり: 送信データに trim された assignee が含まれる', () => {
    const onSubmit = vi.fn();
    const { unmount, container } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: VALID_TITLE } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: VALID_DESC } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '  Dana  ' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledOnce();
      expect(onSubmit.mock.calls[0][0].assignee).toBe('Dana');
    } finally {
      unmount();
    }
  });

  it('assignee が空白のみ: 送信データの assignee は undefined になる', () => {
    const onSubmit = vi.fn();
    const { unmount, container } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: VALID_TITLE } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: VALID_DESC } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '   ' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledOnce();
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });

  it('assignee 未入力: 送信データの assignee は undefined になる', () => {
    const onSubmit = vi.fn();
    const { unmount, container } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: VALID_TITLE } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: VALID_DESC } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledOnce();
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });
});

describe('TicketForm - title length validation', () => {
  it('201文字のタイトルはエラーになる (validate の maxLength 分岐)', () => {
    const onSubmit = vi.fn();
    const { unmount, container } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      const longTitle = 'a'.repeat(201);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: longTitle } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: VALID_DESC } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(q.getByTestId('title-error').textContent).toBe(
        'Title must be 200 characters or less'
      );
      expect(onSubmit).not.toHaveBeenCalled();
    } finally {
      unmount();
    }
  });
});
