/**
 * Coverage-oriented tests for TicketForm.tsx assignee input.
 *
 * The existing PBT suite never types into the assignee field, so line 113
 * (setAssignee onChange) is uncovered. These tests exercise:
 *   - typing into the assignee input updates the field value
 *   - the trimmed assignee value flows into the onSubmit payload
 *   - whitespace-only assignee is normalized to undefined
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

describe('TicketForm - assignee input (coverage)', () => {
  it('assignee 入力欄への入力が value に反映される', () => {
    const { q, unmount } = renderForm();
    try {
      const input = q.getByTestId('assignee-input') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'Charlie' } });
      expect(input.value).toBe('Charlie');
    } finally {
      unmount();
    }
  });

  it('assignee 入力後に submit すると trim された値が渡される', () => {
    const { q, onSubmit, unmount } = renderForm();
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Bug in login' } });
      fireEvent.change(q.getByTestId('description-input'), {
        target: { value: 'Repro steps here' },
      });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '  Dana  ' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledOnce();
      const payload = onSubmit.mock.calls[0][0];
      expect(payload.assignee).toBe('Dana');
    } finally {
      unmount();
    }
  });

  it('assignee 未入力時の submit 結果は assignee=undefined', () => {
    const { q, onSubmit, unmount } = renderForm();
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Docs update' } });
      fireEvent.change(q.getByTestId('description-input'), {
        target: { value: 'Fix typo in README' },
      });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledOnce();
      const payload = onSubmit.mock.calls[0][0];
      expect(payload.assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });

  it('空白のみの assignee は undefined に正規化される', () => {
    const { q, onSubmit, unmount } = renderForm();
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Small task' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Details' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '   ' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledOnce();
      const payload = onSubmit.mock.calls[0][0];
      expect(payload.assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });
});
