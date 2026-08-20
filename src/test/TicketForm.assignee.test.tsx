/**
 * Coverage tests for TicketForm's assignee input.
 *
 * Targets uncovered branch in TicketForm.tsx line 113:
 *   onChange={e => setAssignee(e.target.value)}
 *
 * Existing PBT tests never fill the assignee input, so both the state
 * update and the trimmed value propagation to onSubmit are unexercised.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

describe('TicketForm - assignee input', () => {
  it('assignee 入力の値が input の value に反映される', () => {
    const { unmount, container } = render(
      <TicketForm onSubmit={vi.fn()} onCancel={vi.fn()} />
    );

    try {
      const input = within(container).getByTestId('assignee-input') as HTMLInputElement;
      expect(input.value).toBe('');

      fireEvent.change(input, { target: { value: 'Alice' } });
      expect(input.value).toBe('Alice');
    } finally {
      unmount();
    }
  });

  it('assignee 入力を埋めて送信すると onSubmit に trim された assignee が渡る', () => {
    const onSubmit = vi.fn();
    const { unmount, container } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );

    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'A title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'A desc' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '   Bob   ' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].assignee).toBe('Bob');
    } finally {
      unmount();
    }
  });

  it('assignee が空文字のときは onSubmit に undefined が渡る', () => {
    const onSubmit = vi.fn();
    const { unmount, container } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );

    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'A title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'A desc' } });
      // Leave assignee blank
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });

  it('assignee が空白のみの場合は onSubmit に undefined が渡る', () => {
    const onSubmit = vi.fn();
    const { unmount, container } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );

    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'A title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'A desc' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '   ' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });

  it('201文字以上のタイトルはバリデーションエラーになる', () => {
    // Also covers TicketForm.tsx line 20 (title length branch)
    const onSubmit = vi.fn();
    const { unmount, container } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );

    try {
      const q = within(container);
      const longTitle = 'a'.repeat(201);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: longTitle } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'valid desc' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).not.toHaveBeenCalled();
      const err = q.getByTestId('title-error');
      expect(err.textContent).toMatch(/200/);
    } finally {
      unmount();
    }
  });
});
