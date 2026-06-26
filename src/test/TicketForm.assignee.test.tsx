/**
 * Tests covering the TicketForm assignee input handler.
 * Targets the previously uncovered onChange handler on the assignee input,
 * and verifies that trimmed assignee values are passed to onSubmit.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

function renderForm() {
  const onSubmit = vi.fn();
  const onCancel = vi.fn();
  const result = render(<TicketForm onSubmit={onSubmit} onCancel={onCancel} />);
  const q = within(result.container);
  return { ...result, q, onSubmit, onCancel };
}

describe('TicketForm - assignee input', () => {
  it('assignee 入力欄に文字を入力すると value が反映される', () => {
    const { unmount, q } = renderForm();
    try {
      const input = q.getByTestId('assignee-input') as HTMLInputElement;
      expect(input.value).toBe('');
      fireEvent.change(input, { target: { value: 'Charlie' } });
      expect(input.value).toBe('Charlie');
    } finally {
      unmount();
    }
  });

  it('assignee を入力して submit すると trim された assignee が onSubmit に渡る', () => {
    const { unmount, q, onSubmit } = renderForm();
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Some title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Some description' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '  Diana  ' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledOnce();
      const submitted = onSubmit.mock.calls[0][0];
      expect(submitted.assignee).toBe('Diana');
    } finally {
      unmount();
    }
  });

  it('assignee が空のまま submit すると onSubmit.assignee は undefined', () => {
    const { unmount, q, onSubmit } = renderForm();
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Desc' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledOnce();
      const submitted = onSubmit.mock.calls[0][0];
      expect(submitted.assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });

  it('assignee に空白だけ入力した場合、submit.assignee は undefined になる', () => {
    const { unmount, q, onSubmit } = renderForm();
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Desc' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '   ' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledOnce();
      const submitted = onSubmit.mock.calls[0][0];
      expect(submitted.assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });

  it('連続して assignee を変更すると最後の入力値が submit される', () => {
    const { unmount, q, onSubmit } = renderForm();
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Desc' } });
      const input = q.getByTestId('assignee-input');
      fireEvent.change(input, { target: { value: 'Alice' } });
      fireEvent.change(input, { target: { value: 'Bob' } });
      fireEvent.change(input, { target: { value: 'Eve' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledOnce();
      const submitted = onSubmit.mock.calls[0][0];
      expect(submitted.assignee).toBe('Eve');
    } finally {
      unmount();
    }
  });
});
