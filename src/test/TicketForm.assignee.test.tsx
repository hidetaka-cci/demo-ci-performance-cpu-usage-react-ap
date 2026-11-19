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

function fillRequiredFields(q: ReturnType<typeof within>, title = 'Test title', desc = 'Test description') {
  fireEvent.change(q.getByTestId('title-input'), { target: { value: title } });
  fireEvent.change(q.getByTestId('description-input'), { target: { value: desc } });
}

describe('TicketForm - assignee input', () => {
  it('assigneeフィールドに入力してsubmitするとassigneeが送信される', () => {
    const { q, onSubmit, unmount } = renderForm();
    try {
      fillRequiredFields(q);
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: 'John Doe' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledOnce();
      expect(onSubmit.mock.calls[0][0].assignee).toBe('John Doe');
    } finally {
      unmount();
    }
  });

  it('assigneeを空にしてsubmitするとassigneeはundefinedになる', () => {
    const { q, onSubmit, unmount } = renderForm();
    try {
      fillRequiredFields(q);
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledOnce();
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });

  it('assigneeに空白のみ入力した場合はundefinedになる', () => {
    const { q, onSubmit, unmount } = renderForm();
    try {
      fillRequiredFields(q);
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '   ' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledOnce();
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });

  it('assigneeの前後の空白はtrimされる', () => {
    const { q, onSubmit, unmount } = renderForm();
    try {
      fillRequiredFields(q);
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '  Bob  ' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledOnce();
      expect(onSubmit.mock.calls[0][0].assignee).toBe('Bob');
    } finally {
      unmount();
    }
  });
});
