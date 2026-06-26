/**
 * Coverage tests for TicketForm assignee input.
 *
 * The existing TicketForm test suite never edits the assignee field, leaving
 * the onChange handler at TicketForm.tsx:113 uncovered. These tests exercise
 * the assignee input directly and confirm trimming/optional behaviour at
 * submit time.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import { TicketForm } from '../components/TicketForm';

const NUM_RUNS = 50;
const nonEmptyName = fc
  .string({ minLength: 1, maxLength: 50 })
  .filter(s => s.trim().length > 0);

function renderForm() {
  const onSubmit = vi.fn();
  const onCancel = vi.fn();
  const result = render(<TicketForm onSubmit={onSubmit} onCancel={onCancel} />);
  return { ...result, q: within(result.container), onSubmit, onCancel };
}

describe('TicketForm - assignee input', () => {
  it('assignee 入力欄に文字を入力すると value が反映される', () => {
    const { q, unmount } = renderForm();
    try {
      const input = q.getByTestId('assignee-input') as HTMLInputElement;
      expect(input.value).toBe('');
      fireEvent.change(input, { target: { value: 'Alice' } });
      expect(input.value).toBe('Alice');
    } finally {
      unmount();
    }
  });

  it('有効な assignee で送信すると onSubmit ペイロードに含まれる', () => {
    const { q, onSubmit, unmount } = renderForm();
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'A title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'A description' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: 'Bob' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].assignee).toBe('Bob');
    } finally {
      unmount();
    }
  });

  it('assignee 前後の空白は trim されて送信される', () => {
    const { q, onSubmit, unmount } = renderForm();
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'A title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'A description' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '  Carol  ' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].assignee).toBe('Carol');
    } finally {
      unmount();
    }
  });

  it('空白のみの assignee で送信すると undefined になる', () => {
    const { q, onSubmit, unmount } = renderForm();
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'A title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'A description' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '   ' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });

  it('assignee を入力しないと送信時に undefined になる', () => {
    const { q, onSubmit, unmount } = renderForm();
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'A title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'A description' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });

  it('任意の non-empty assignee 入力は trim された値として送信される', () => {
    fc.assert(
      fc.property(nonEmptyName, (name) => {
        const { q, onSubmit, unmount } = renderForm();
        try {
          fireEvent.change(q.getByTestId('title-input'), { target: { value: 'A title' } });
          fireEvent.change(q.getByTestId('description-input'), { target: { value: 'A description' } });
          fireEvent.change(q.getByTestId('assignee-input'), { target: { value: name } });
          fireEvent.click(q.getByTestId('submit-button'));

          expect(onSubmit).toHaveBeenCalledTimes(1);
          expect(onSubmit.mock.calls[0][0].assignee).toBe(name.trim());
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });
});

describe('TicketForm - title length validation', () => {
  it('201文字のタイトルでは長さエラーが表示され onSubmit は呼ばれない', () => {
    const { q, onSubmit, unmount } = renderForm();
    try {
      const longTitle = 'a'.repeat(201);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: longTitle } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'A description' } });
      fireEvent.click(q.getByTestId('submit-button'));

      const err = q.getByTestId('title-error');
      expect(err).toBeInTheDocument();
      expect(err.textContent).toBe('Title must be 200 characters or less');
      expect(onSubmit).not.toHaveBeenCalled();
    } finally {
      unmount();
    }
  });

  it('ちょうど200文字のタイトルは受理されて onSubmit が呼ばれる', () => {
    const { q, onSubmit, unmount } = renderForm();
    try {
      const okTitle = 'a'.repeat(200);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: okTitle } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'A description' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].title).toBe(okTitle);
    } finally {
      unmount();
    }
  });
});
