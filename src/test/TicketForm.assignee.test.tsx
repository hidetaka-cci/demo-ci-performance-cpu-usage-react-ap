/**
 * Coverage tests for TicketForm.tsx assignee input handler
 *
 * Covers TicketForm.tsx line 113 (setAssignee onChange handler), which is
 * not exercised by the existing PBT suite.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';
import type { TicketFormData } from '../types/ticket';

function submitWith(
  q: ReturnType<typeof within>,
  { title, description, assignee }: { title: string; description: string; assignee?: string },
) {
  fireEvent.change(q.getByTestId('title-input'), { target: { value: title } });
  fireEvent.change(q.getByTestId('description-input'), { target: { value: description } });
  if (assignee !== undefined) {
    fireEvent.change(q.getByTestId('assignee-input'), { target: { value: assignee } });
  }
  fireEvent.click(q.getByTestId('submit-button'));
}

describe('TicketForm - assignee input', () => {
  it('assignee 入力値は onSubmit の payload に含まれる', () => {
    const onSubmit = vi.fn<(data: TicketFormData) => void>();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />,
    );
    try {
      const q = within(container);
      submitWith(q, {
        title: 'Fix bug',
        description: 'Steps to reproduce',
        assignee: 'Carol',
      });
      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].assignee).toBe('Carol');
    } finally {
      unmount();
    }
  });

  it('assignee input の value は入力に追従する (制御コンポーネント)', () => {
    const { container, unmount } = render(
      <TicketForm onSubmit={vi.fn()} onCancel={vi.fn()} />,
    );
    try {
      const q = within(container);
      const input = q.getByTestId('assignee-input') as HTMLInputElement;
      expect(input.value).toBe('');
      fireEvent.change(input, { target: { value: 'Dave' } });
      expect(input.value).toBe('Dave');
    } finally {
      unmount();
    }
  });

  it('assignee 未入力なら payload の assignee は undefined になる', () => {
    const onSubmit = vi.fn<(data: TicketFormData) => void>();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />,
    );
    try {
      const q = within(container);
      submitWith(q, { title: 'title', description: 'desc' });
      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });

  it('assignee の前後空白は trim される', () => {
    const onSubmit = vi.fn<(data: TicketFormData) => void>();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />,
    );
    try {
      const q = within(container);
      submitWith(q, {
        title: 'title',
        description: 'desc',
        assignee: '   Eve   ',
      });
      expect(onSubmit.mock.calls[0][0].assignee).toBe('Eve');
    } finally {
      unmount();
    }
  });

  it('assignee が空白のみの場合、payload の assignee は undefined になる', () => {
    const onSubmit = vi.fn<(data: TicketFormData) => void>();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />,
    );
    try {
      const q = within(container);
      submitWith(q, {
        title: 'title',
        description: 'desc',
        assignee: '     ',
      });
      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });
});
