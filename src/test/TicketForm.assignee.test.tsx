/**
 * Coverage tests for TicketForm assignee input.
 *
 * The existing PBT suite never types into the assignee field, so the
 * `onChange={e => setAssignee(e.target.value)}` handler
 * (TicketForm.tsx:113) never runs. These tests cover the assignee state
 * and its inclusion in the submitted payload.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

describe('TicketForm - assignee input', () => {
  it('assignee 入力の変更が state に反映される', () => {
    const { container, unmount } = render(
      <TicketForm onSubmit={vi.fn()} onCancel={vi.fn()} />
    );
    try {
      const input = within(container).getByTestId('assignee-input') as HTMLInputElement;
      expect(input.value).toBe('');
      fireEvent.change(input, { target: { value: 'Alice' } });
      expect(input.value).toBe('Alice');
    } finally {
      unmount();
    }
  });

  it('assignee 有りで submit すると trim された値が onSubmit に渡る', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'A title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'A description' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '  Bob  ' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      const submitted = onSubmit.mock.calls[0][0];
      expect(submitted.assignee).toBe('Bob');
    } finally {
      unmount();
    }
  });

  it('assignee が空文字なら undefined として送信される', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Desc' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      const submitted = onSubmit.mock.calls[0][0];
      expect(submitted.assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });

  it('assignee が空白のみでも undefined として送信される', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Desc' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '    ' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      const submitted = onSubmit.mock.calls[0][0];
      expect(submitted.assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });
});
