/**
 * Coverage-oriented tests for TicketForm.tsx title length validation.
 *
 * The existing PBT suite covers the empty-title branch but not the
 * "title must be 200 characters or less" branch on line 20. These tests
 * exercise:
 *   - a title longer than 200 chars shows the length error and blocks submit
 *   - exactly 200 chars is accepted (boundary condition)
 *   - 201 chars is rejected (boundary +1)
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

function renderForm() {
  const onSubmit = vi.fn();
  const onCancel = vi.fn();
  const result = render(<TicketForm onSubmit={onSubmit} onCancel={onCancel} />);
  return { ...result, onSubmit, onCancel, q: within(result.container) };
}

describe('TicketForm - title length validation (coverage)', () => {
  it('201 文字のタイトルで submit するとエラーが表示され onSubmit は呼ばれない', () => {
    const { q, onSubmit, unmount } = renderForm();
    try {
      const tooLong = 'a'.repeat(201);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: tooLong } });
      fireEvent.change(q.getByTestId('description-input'), {
        target: { value: 'Valid description' },
      });
      fireEvent.click(q.getByTestId('submit-button'));

      const err = q.getByTestId('title-error');
      expect(err).toBeInTheDocument();
      expect(err.textContent).toBe('Title must be 200 characters or less');
      expect(onSubmit).not.toHaveBeenCalled();
    } finally {
      unmount();
    }
  });

  it('ちょうど 200 文字のタイトルは受け付けられ onSubmit が呼ばれる', () => {
    const { q, onSubmit, unmount } = renderForm();
    try {
      const exactly200 = 'a'.repeat(200);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: exactly200 } });
      fireEvent.change(q.getByTestId('description-input'), {
        target: { value: 'Valid description' },
      });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(q.queryByTestId('title-error')).not.toBeInTheDocument();
      expect(onSubmit).toHaveBeenCalledOnce();
      const payload = onSubmit.mock.calls[0][0];
      expect(payload.title).toBe(exactly200);
    } finally {
      unmount();
    }
  });

  it('前後空白付きで 200 文字を超える見た目でも trim 後 200 以下なら受け付けられる', () => {
    const { q, onSubmit, unmount } = renderForm();
    try {
      // Raw length is 210 but trimmed length is 200 → should pass
      const raw = '     ' + 'a'.repeat(200) + '     ';
      fireEvent.change(q.getByTestId('title-input'), { target: { value: raw } });
      fireEvent.change(q.getByTestId('description-input'), {
        target: { value: 'Valid description' },
      });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(q.queryByTestId('title-error')).not.toBeInTheDocument();
      expect(onSubmit).toHaveBeenCalledOnce();
      const payload = onSubmit.mock.calls[0][0];
      expect(payload.title).toBe('a'.repeat(200));
    } finally {
      unmount();
    }
  });

  it('trim 後に 201 文字残るタイトルはエラーになる', () => {
    const { q, onSubmit, unmount } = renderForm();
    try {
      const raw = '  ' + 'b'.repeat(201) + '  ';
      fireEvent.change(q.getByTestId('title-input'), { target: { value: raw } });
      fireEvent.change(q.getByTestId('description-input'), {
        target: { value: 'Valid description' },
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
