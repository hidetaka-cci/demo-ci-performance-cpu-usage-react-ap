/**
 * Unit tests for TicketForm's title length validation.
 * Covers the previously uncovered branch at src/components/TicketForm.tsx:20
 * where a title longer than 200 characters produces an error.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

describe('TicketForm - title length validation', () => {
  it('title が 201 文字だと "200 characters or less" エラーが表示され onSubmit は呼ばれない', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />,
    );
    try {
      const q = within(container);
      const longTitle = 'a'.repeat(201);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: longTitle } });
      fireEvent.change(q.getByTestId('description-input'), {
        target: { value: 'Any valid description' },
      });
      fireEvent.click(q.getByTestId('submit-button'));

      const err = q.getByTestId('title-error');
      expect(err.textContent).toBe('Title must be 200 characters or less');
      expect(onSubmit).not.toHaveBeenCalled();
    } finally {
      unmount();
    }
  });

  it('title がちょうど 200 文字なら title-error は出ず onSubmit が呼ばれる', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />,
    );
    try {
      const q = within(container);
      const okTitle = 'b'.repeat(200);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: okTitle } });
      fireEvent.change(q.getByTestId('description-input'), {
        target: { value: 'Any valid description' },
      });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(q.queryByTestId('title-error')).not.toBeInTheDocument();
      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].title).toBe(okTitle);
    } finally {
      unmount();
    }
  });

  it('前後の空白を除いた長さで判定される: 前後空白込み 210 文字 / trim 後 200 文字なら通る', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />,
    );
    try {
      const q = within(container);
      // 200 chars of content padded with 5 spaces on each side → trims back to 200
      const padded = `${' '.repeat(5)}${'c'.repeat(200)}${' '.repeat(5)}`;
      fireEvent.change(q.getByTestId('title-input'), { target: { value: padded } });
      fireEvent.change(q.getByTestId('description-input'), {
        target: { value: 'Any valid description' },
      });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(q.queryByTestId('title-error')).not.toBeInTheDocument();
      expect(onSubmit).toHaveBeenCalledTimes(1);
      // Title should be trimmed to 200 chars
      expect(onSubmit.mock.calls[0][0].title.length).toBe(200);
    } finally {
      unmount();
    }
  });

  it('前後空白を除いた実質長が 201 文字だと "200 characters or less" エラーになる', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />,
    );
    try {
      const q = within(container);
      const padded = `  ${'d'.repeat(201)}  `;
      fireEvent.change(q.getByTestId('title-input'), { target: { value: padded } });
      fireEvent.change(q.getByTestId('description-input'), {
        target: { value: 'Any valid description' },
      });
      fireEvent.click(q.getByTestId('submit-button'));

      const err = q.getByTestId('title-error');
      expect(err.textContent).toBe('Title must be 200 characters or less');
      expect(onSubmit).not.toHaveBeenCalled();
    } finally {
      unmount();
    }
  });
});
