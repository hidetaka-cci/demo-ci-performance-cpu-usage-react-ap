/**
 * Coverage-focused tests for TicketForm assignee handling.
 *
 * Targets:
 *  - assignee input onChange handler (TicketForm.tsx:113)
 *  - Empty / whitespace-only assignee is normalized to undefined in onSubmit payload
 *  - Non-empty assignee is trimmed and forwarded in onSubmit payload
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';
import type { TicketFormData } from '../types/ticket';

function fillRequired(q: ReturnType<typeof within>, title = 'Title', desc = 'Description') {
  fireEvent.change(q.getByTestId('title-input'), { target: { value: title } });
  fireEvent.change(q.getByTestId('description-input'), { target: { value: desc } });
}

describe('TicketForm - assignee field', () => {
  it('assignee input への入力が反映される', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      const assigneeInput = q.getByTestId('assignee-input') as HTMLInputElement;
      fireEvent.change(assigneeInput, { target: { value: 'Alice' } });
      expect(assigneeInput.value).toBe('Alice');
    } finally {
      unmount();
    }
  });

  it('assignee が空文字のまま submit すると payload.assignee は undefined', () => {
    const onSubmit = vi.fn<(data: TicketFormData) => void>();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fillRequired(q);
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });

  it('assignee にホワイトスペースのみ入力した場合は undefined として渡される', () => {
    const onSubmit = vi.fn<(data: TicketFormData) => void>();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fillRequired(q);
      fireEvent.change(q.getByTestId('assignee-input'), {
        target: { value: '   ' },
      });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });

  it('assignee は trim された値で onSubmit に渡される', () => {
    const onSubmit = vi.fn<(data: TicketFormData) => void>();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fillRequired(q);
      fireEvent.change(q.getByTestId('assignee-input'), {
        target: { value: '  Bob  ' },
      });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].assignee).toBe('Bob');
    } finally {
      unmount();
    }
  });

  it('title が空 or ホワイトスペースのみだと onSubmit は呼ばれず title-error が表示される', () => {
    const onSubmit = vi.fn<(data: TicketFormData) => void>();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      // description は埋めるが title は空のまま
      fireEvent.change(q.getByTestId('description-input'), {
        target: { value: 'desc' },
      });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).not.toHaveBeenCalled();
      const err = q.getByTestId('title-error');
      expect(err).toBeInTheDocument();
      expect(err.textContent).toContain('Title is required');
    } finally {
      unmount();
    }
  });

  it('title が 201 文字超の場合は "200 characters or less" エラーが表示される', () => {
    const onSubmit = vi.fn<(data: TicketFormData) => void>();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), {
        target: { value: 'a'.repeat(201) },
      });
      fireEvent.change(q.getByTestId('description-input'), {
        target: { value: 'desc' },
      });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).not.toHaveBeenCalled();
      const err = q.getByTestId('title-error');
      expect(err.textContent).toContain('200 characters or less');
    } finally {
      unmount();
    }
  });

  it('priority select の変更が onSubmit の payload に反映される', () => {
    const onSubmit = vi.fn<(data: TicketFormData) => void>();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fillRequired(q);
      fireEvent.change(q.getByTestId('priority-select'), {
        target: { value: 'critical' },
      });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].priority).toBe('critical');
    } finally {
      unmount();
    }
  });

  it('カンマ区切り tags の空要素は除去される', () => {
    const onSubmit = vi.fn<(data: TicketFormData) => void>();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fillRequired(q);
      fireEvent.change(q.getByTestId('tags-input'), {
        target: { value: 'bug, , ui,,frontend' },
      });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].tags).toEqual(['bug', 'ui', 'frontend']);
    } finally {
      unmount();
    }
  });
});
