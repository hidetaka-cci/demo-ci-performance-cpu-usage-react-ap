/**
 * Tests for TicketForm's optional assignee field.
 *
 * Existing PBT tests never type into the assignee input,
 * leaving the onChange handler (TicketForm.tsx:113) uncovered
 * and the assignee-trim branch of handleSubmit under-tested.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

function fillRequired(container: HTMLElement) {
  const q = within(container);
  fireEvent.change(q.getByTestId('title-input'), { target: { value: 'A valid title' } });
  fireEvent.change(q.getByTestId('description-input'), {
    target: { value: 'A valid description' },
  });
}

describe('TicketForm - assignee input', () => {
  it('assignee 入力欄に入力すると value が反映される', () => {
    const { unmount, container } = render(
      <TicketForm onSubmit={vi.fn()} onCancel={vi.fn()} />
    );
    try {
      const input = within(container).getByTestId('assignee-input') as HTMLInputElement;
      expect(input.value).toBe('');
      fireEvent.change(input, { target: { value: 'Charlie' } });
      expect(input.value).toBe('Charlie');
    } finally {
      unmount();
    }
  });

  it('assignee を入力して submit すると trim された値が onSubmit に渡される', () => {
    const onSubmit = vi.fn();
    const { unmount, container } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      fillRequired(container);
      fireEvent.change(within(container).getByTestId('assignee-input'), {
        target: { value: '  Dana  ' },
      });
      fireEvent.click(within(container).getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].assignee).toBe('Dana');
    } finally {
      unmount();
    }
  });

  it('assignee 未入力の場合は undefined として渡される (エッジケース)', () => {
    const onSubmit = vi.fn();
    const { unmount, container } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      fillRequired(container);
      fireEvent.click(within(container).getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });

  it('assignee が空白のみの場合は undefined として渡される (エッジケース)', () => {
    const onSubmit = vi.fn();
    const { unmount, container } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      fillRequired(container);
      fireEvent.change(within(container).getByTestId('assignee-input'), {
        target: { value: '     ' },
      });
      fireEvent.click(within(container).getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });

  it('title が 200 文字超の場合はバリデーションエラーが表示され onSubmit は呼ばれない', () => {
    // Also covers the title-length branch of validate() which existing tests miss.
    const onSubmit = vi.fn();
    const { unmount, container } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), {
        target: { value: 'x'.repeat(201) },
      });
      fireEvent.change(q.getByTestId('description-input'), {
        target: { value: 'valid description' },
      });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).not.toHaveBeenCalled();
      const err = q.getByTestId('title-error');
      expect(err.textContent).toBe('Title must be 200 characters or less');
    } finally {
      unmount();
    }
  });
});
