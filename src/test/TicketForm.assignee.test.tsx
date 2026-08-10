/**
 * Unit tests for TicketForm's assignee input.
 * Covers the previously uncovered onChange handler at
 * src/components/TicketForm.tsx:113 and confirms the value is forwarded
 * (trimmed) to onSubmit.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

describe('TicketForm - assignee input', () => {
  it('assignee 入力欄に値を入力すると input.value に反映される', () => {
    const { container, unmount } = render(
      <TicketForm onSubmit={vi.fn()} onCancel={vi.fn()} />,
    );
    try {
      const input = within(container).getByTestId('assignee-input') as HTMLInputElement;
      expect(input.value).toBe('');
      fireEvent.change(input, { target: { value: 'Dave' } });
      expect(input.value).toBe('Dave');
    } finally {
      unmount();
    }
  });

  it('有効な送信で assignee が trim されて onSubmit に渡る', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />,
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Broken login' } });
      fireEvent.change(q.getByTestId('description-input'), {
        target: { value: 'Server returns 500 on wrong password' },
      });
      fireEvent.change(q.getByTestId('assignee-input'), {
        target: { value: '  Dave  ' },
      });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      const data = onSubmit.mock.calls[0][0];
      expect(data.assignee).toBe('Dave');
      expect(data.title).toBe('Broken login');
      expect(data.description).toBe('Server returns 500 on wrong password');
    } finally {
      unmount();
    }
  });

  it('assignee が空白のみの場合は undefined として送信される', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />,
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Add dark mode' } });
      fireEvent.change(q.getByTestId('description-input'), {
        target: { value: 'Users want a dark theme option' },
      });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '   ' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      const data = onSubmit.mock.calls[0][0];
      expect(data.assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });

  it('assignee が未入力（空文字）の場合も undefined として送信される', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />,
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Refactor router' } });
      fireEvent.change(q.getByTestId('description-input'), {
        target: { value: 'Split router into feature modules' },
      });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      const data = onSubmit.mock.calls[0][0];
      expect(data.assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });
});
