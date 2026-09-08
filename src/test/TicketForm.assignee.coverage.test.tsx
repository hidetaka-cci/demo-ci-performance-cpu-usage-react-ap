import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';
import type { TicketFormData } from '../types/ticket';

function fillRequired(container: HTMLElement, title = 'Fix bug', description = 'Something is broken') {
  fireEvent.change(within(container).getByTestId('title-input'), { target: { value: title } });
  fireEvent.change(within(container).getByTestId('description-input'), { target: { value: description } });
}

describe('TicketForm - assignee input coverage', () => {
  it('assignee input に入力した文字列が state に反映される', () => {
    const { unmount, container } = render(
      <TicketForm onSubmit={vi.fn()} onCancel={vi.fn()} />
    );
    try {
      const assigneeInput = within(container).getByTestId('assignee-input') as HTMLInputElement;
      expect(assigneeInput.value).toBe('');
      fireEvent.change(assigneeInput, { target: { value: 'Alice' } });
      expect(assigneeInput.value).toBe('Alice');
    } finally {
      unmount();
    }
  });

  it('assignee を入力して submit すると trim された値が onSubmit に渡される', () => {
    const onSubmit = vi.fn<(data: TicketFormData) => void>();
    const { unmount, container } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      fillRequired(container);
      fireEvent.change(within(container).getByTestId('assignee-input'), {
        target: { value: '  Bob  ' },
      });
      fireEvent.click(within(container).getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].assignee).toBe('Bob');
    } finally {
      unmount();
    }
  });

  it('assignee が空文字のまま submit すると undefined が渡される', () => {
    const onSubmit = vi.fn<(data: TicketFormData) => void>();
    const { unmount, container } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      fillRequired(container);
      // Do not touch assignee input — falsy branch of `assignee?.trim() || undefined`
      fireEvent.click(within(container).getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });

  it('assignee が空白のみでも undefined として扱われる', () => {
    const onSubmit = vi.fn<(data: TicketFormData) => void>();
    const { unmount, container } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      fillRequired(container);
      fireEvent.change(within(container).getByTestId('assignee-input'), {
        target: { value: '   ' },
      });
      fireEvent.click(within(container).getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });
});
