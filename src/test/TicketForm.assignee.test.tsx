/**
 * Targeted tests for TicketForm assignee input
 *
 * Covers TicketForm.tsx line 113: assignee onChange handler
 * — typing into the assignee input updates the input value and is included,
 *   trimmed, in the submitted form data (or omitted entirely when blank).
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

function renderForm() {
  const onSubmit = vi.fn();
  const onCancel = vi.fn();
  const result = render(<TicketForm onSubmit={onSubmit} onCancel={onCancel} />);
  return { ...result, onSubmit, onCancel, q: within(result.container) };
}

describe('TicketForm - assignee input', () => {
  it('assignee 入力欄への入力で input value が更新される', () => {
    const { unmount, q } = renderForm();
    try {
      const input = q.getByTestId('assignee-input') as HTMLInputElement;
      expect(input.value).toBe('');
      fireEvent.change(input, { target: { value: 'Alice' } });
      expect(input.value).toBe('Alice');
    } finally {
      unmount();
    }
  });

  it('assignee が入力された状態で submit すると trim された値が渡される', () => {
    const { unmount, q, onSubmit } = renderForm();
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Desc' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '  Bob  ' } });
      fireEvent.click(q.getByTestId('submit-button'));
      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].assignee).toBe('Bob');
    } finally {
      unmount();
    }
  });

  it('assignee が空白のみのときは undefined として送信される', () => {
    const { unmount, q, onSubmit } = renderForm();
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Desc' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '   ' } });
      fireEvent.click(q.getByTestId('submit-button'));
      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });

  it('assignee 未入力のままでも submit は成功する', () => {
    const { unmount, q, onSubmit } = renderForm();
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Desc' } });
      fireEvent.click(q.getByTestId('submit-button'));
      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });
});
