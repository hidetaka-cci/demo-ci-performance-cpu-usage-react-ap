/**
 * Tests for TicketForm assignee field behavior.
 *
 * Covers TicketForm.tsx:113 — the assignee onChange handler is never fired
 * in existing PBT tests.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

describe('TicketForm - assignee field', () => {
  it('assignee フィールドに入力した値が送信データに含まれる', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Test title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Test description' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: 'Alice' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledOnce();
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ assignee: 'Alice' })
      );
    } finally {
      unmount();
    }
  });

  it('assignee フィールドが空のとき送信データの assignee は undefined になる', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Test title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Test description' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledOnce();
      const submitted = onSubmit.mock.calls[0][0];
      expect(submitted.assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });

  it('assignee フィールドに空白のみを入力した場合 assignee は undefined になる', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Test title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Test description' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '   ' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledOnce();
      const submitted = onSubmit.mock.calls[0][0];
      expect(submitted.assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });

  it('assignee を入力してキャンセルした場合 onSubmit は呼ばれない', () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={onCancel} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: 'Bob' } });
      fireEvent.click(q.getByTestId('cancel-button'));

      expect(onSubmit).not.toHaveBeenCalled();
      expect(onCancel).toHaveBeenCalledOnce();
    } finally {
      unmount();
    }
  });
});
