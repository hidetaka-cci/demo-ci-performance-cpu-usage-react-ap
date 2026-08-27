/**
 * Tests for TicketForm's assignee input handling.
 *
 * Covers TicketForm.tsx line 113: the assignee input's onChange handler,
 * plus the submitted-payload shape (trim / undefined-when-empty behavior).
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

function renderForm() {
  const onSubmit = vi.fn();
  const onCancel = vi.fn();
  const result = render(<TicketForm onSubmit={onSubmit} onCancel={onCancel} />);
  return { ...result, q: within(result.container), onSubmit, onCancel };
}

describe('TicketForm - assignee input', () => {
  it('assignee 入力欄はデフォルトで空', () => {
    const { unmount, q } = renderForm();
    try {
      const assignee = q.getByTestId('assignee-input') as HTMLInputElement;
      expect(assignee).toBeInTheDocument();
      expect(assignee.value).toBe('');
    } finally {
      unmount();
    }
  });

  it('assignee 入力欄に入力すると value が更新される', () => {
    const { unmount, q } = renderForm();
    try {
      const assignee = q.getByTestId('assignee-input') as HTMLInputElement;
      fireEvent.change(assignee, { target: { value: 'Charlie' } });
      expect(assignee.value).toBe('Charlie');
    } finally {
      unmount();
    }
  });

  it('assignee を入力して送信すると trim された値が payload に含まれる', () => {
    const { unmount, q, onSubmit } = renderForm();
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'A title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'A description' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '  Dana  ' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledOnce();
      expect(onSubmit.mock.calls[0][0].assignee).toBe('Dana');
    } finally {
      unmount();
    }
  });

  it('assignee が空のまま送信されると payload の assignee は undefined', () => {
    const { unmount, q, onSubmit } = renderForm();
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'A title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'A description' } });
      // assignee は空のまま
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledOnce();
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });

  it('assignee がホワイトスペースのみの場合 payload の assignee は undefined', () => {
    const { unmount, q, onSubmit } = renderForm();
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
});
