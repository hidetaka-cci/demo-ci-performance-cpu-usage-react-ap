/**
 * TicketForm - assignee input coverage
 *
 * Covers the assignee `onChange` handler (see src/components/TicketForm.tsx
 * line 113), and confirms the trimmed assignee is forwarded to onSubmit.
 * Also covers the length-validation branch on title (>200 chars).
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

describe('TicketForm - assignee handling', () => {
  it('assignee 入力が反映され、trim された値で submit される', () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={onCancel} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'My title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'A description' } });
      const assignee = q.getByTestId('assignee-input') as HTMLInputElement;
      fireEvent.change(assignee, { target: { value: '  Alice  ' } });
      expect(assignee.value).toBe('  Alice  ');

      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      const payload = onSubmit.mock.calls[0][0];
      expect(payload.assignee).toBe('Alice');
      expect(payload.title).toBe('My title');
      expect(payload.description).toBe('A description');
    } finally {
      unmount();
    }
  });

  it('assignee が空文字のみのときは undefined として submit される', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'desc' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '   ' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });

  it('title が 200 文字を超える場合はバリデーションエラーが表示され submit されない', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      const longTitle = 'a'.repeat(201);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: longTitle } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'desc' } });
      fireEvent.click(q.getByTestId('submit-button'));

      const err = q.getByTestId('title-error');
      expect(err.textContent).toBe('Title must be 200 characters or less');
      expect(onSubmit).not.toHaveBeenCalled();
    } finally {
      unmount();
    }
  });
});
