/**
 * Coverage tests for TicketForm.
 *
 * - The assignee input onChange handler is not covered by existing tests.
 * - The "title too long" validation branch is not covered.
 * - Priority selection is not covered end-to-end via onSubmit payload.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

describe('TicketForm - coverage', () => {
  it('assignee 入力値が onSubmit のペイロードに反映される', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'My title' } });
      fireEvent.change(q.getByTestId('description-input'), {
        target: { value: 'A description' },
      });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '  Alice  ' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ assignee: 'Alice' })
      );
    } finally {
      unmount();
    }
  });

  it('assignee 未入力の場合 assignee は undefined', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'desc' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ assignee: undefined })
      );
    } finally {
      unmount();
    }
  });

  it('タイトルが200文字を超えるとエラーが表示され onSubmit は呼ばれない', () => {
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

      expect(onSubmit).not.toHaveBeenCalled();
      const err = q.getByTestId('title-error');
      expect(err.textContent).toBe('Title must be 200 characters or less');
    } finally {
      unmount();
    }
  });

  it('priority を変更した値が onSubmit に反映される', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'desc' } });
      fireEvent.change(q.getByTestId('priority-select'), { target: { value: 'critical' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ priority: 'critical' })
      );
    } finally {
      unmount();
    }
  });
});
