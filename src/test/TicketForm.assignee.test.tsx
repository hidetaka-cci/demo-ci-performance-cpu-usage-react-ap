/**
 * Coverage-targeted tests for TicketForm assignee input (line 113).
 *
 * The existing property tests never type into the assignee field, leaving
 * the onChange handler and the "assignee → submitted payload" path
 * uncovered. This file exercises both paths with focused unit tests.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

describe('TicketForm - assignee input coverage', () => {
  it('assignee 入力に値を入れると input の value が反映される', () => {
    const { unmount, container } = render(
      <TicketForm onSubmit={vi.fn()} onCancel={vi.fn()} />
    );
    try {
      const assigneeInput = within(container).getByTestId(
        'assignee-input'
      ) as HTMLInputElement;
      expect(assigneeInput.value).toBe('');

      fireEvent.change(assigneeInput, { target: { value: 'Alice' } });
      expect(assigneeInput.value).toBe('Alice');
    } finally {
      unmount();
    }
  });

  it('assignee 入力後に submit すると trim された assignee が payload に含まれる', () => {
    const onSubmit = vi.fn();
    const { unmount, container } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), {
        target: { value: 'Title' },
      });
      fireEvent.change(q.getByTestId('description-input'), {
        target: { value: 'Description' },
      });
      fireEvent.change(q.getByTestId('assignee-input'), {
        target: { value: '  Bob  ' },
      });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledOnce();
      const submitted = onSubmit.mock.calls[0][0];
      expect(submitted.assignee).toBe('Bob');
    } finally {
      unmount();
    }
  });

  it('assignee が空 or 空白のみの場合、payload の assignee は undefined', () => {
    const onSubmit = vi.fn();
    const { unmount, container } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), {
        target: { value: 'Title' },
      });
      fireEvent.change(q.getByTestId('description-input'), {
        target: { value: 'Description' },
      });
      // Enter whitespace only in assignee to exercise the falsy `|| undefined` branch
      fireEvent.change(q.getByTestId('assignee-input'), {
        target: { value: '   ' },
      });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledOnce();
      const submitted = onSubmit.mock.calls[0][0];
      expect(submitted.assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });
});
