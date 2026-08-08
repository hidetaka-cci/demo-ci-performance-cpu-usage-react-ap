/**
 * Coverage-boost tests for TicketForm component - assignee field.
 *
 * Existing PBT tests do not exercise the assignee input's onChange handler
 * nor verify that the trimmed assignee value flows into onSubmit,
 * leaving TicketForm.tsx:113 uncovered.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

function setup() {
  const onSubmit = vi.fn();
  const onCancel = vi.fn();
  const result = render(<TicketForm onSubmit={onSubmit} onCancel={onCancel} />);
  return { onSubmit, onCancel, ...result, q: within(result.container) };
}

describe('TicketForm - assignee handling', () => {
  it('assignee input への入力が value に反映される', () => {
    const { unmount, q } = setup();
    try {
      const input = q.getByTestId('assignee-input') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'Alice' } });
      expect(input.value).toBe('Alice');
    } finally {
      unmount();
    }
  });

  it('assignee 入力後の submit で trim された値が onSubmit に渡る', () => {
    const { unmount, q, onSubmit } = setup();
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'A title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'A description' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '  Bob  ' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledOnce();
      expect(onSubmit.mock.calls[0][0].assignee).toBe('Bob');
    } finally {
      unmount();
    }
  });

  it('assignee が空文字のみの場合、undefined として送信される', () => {
    const { unmount, q, onSubmit } = setup();
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'A title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'A description' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '   ' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledOnce();
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });

  it('assignee 未入力なら undefined として送信される', () => {
    const { unmount, q, onSubmit } = setup();
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'A title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'A description' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledOnce();
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });

  it('200文字を超えるタイトルはバリデーションエラーとなり onSubmit は呼ばれない', () => {
    const { unmount, q, onSubmit } = setup();
    try {
      const longTitle = 'x'.repeat(201);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: longTitle } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'A description' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(q.getByTestId('title-error')).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    } finally {
      unmount();
    }
  });
});
