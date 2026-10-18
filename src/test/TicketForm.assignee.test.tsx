/**
 * Coverage tests for TicketForm assignee input (line 113 in TicketForm.tsx).
 *
 * The existing PBT tests never fire a change event on the assignee input,
 * leaving its onChange handler uncovered. These tests also verify that the
 * assignee value is correctly trimmed and forwarded on submit, and that an
 * empty assignee maps to undefined in the submitted data.
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
  it('担当者入力を変更するとフィールドの値が更新される', () => {
    const { unmount, q } = renderForm();
    try {
      const input = q.getByTestId('assignee-input') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'Alice' } });
      expect(input.value).toBe('Alice');
    } finally {
      unmount();
    }
  });

  it('担当者を入力してsubmitすると onSubmit に assignee が渡される', () => {
    const { unmount, q, onSubmit } = renderForm();
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'My Title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'My Description' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: 'Alice' } });
      fireEvent.click(q.getByTestId('submit-button'));
      expect(onSubmit).toHaveBeenCalledOnce();
      expect(onSubmit.mock.calls[0][0].assignee).toBe('Alice');
    } finally {
      unmount();
    }
  });

  it('空白のみの担当者でsubmitすると assignee は undefined になる', () => {
    const { unmount, q, onSubmit } = renderForm();
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'My Title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'My Description' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '   ' } });
      fireEvent.click(q.getByTestId('submit-button'));
      expect(onSubmit).toHaveBeenCalledOnce();
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });

  it('担当者フィールドが空のままsubmitすると assignee は undefined になる', () => {
    const { unmount, q, onSubmit } = renderForm();
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'My Title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'My Description' } });
      fireEvent.click(q.getByTestId('submit-button'));
      expect(onSubmit).toHaveBeenCalledOnce();
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });
});
