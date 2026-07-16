/**
 * Coverage tests for TicketForm's assignee input.
 *
 * The existing property-based tests do not exercise the assignee input's
 * onChange handler (line 113), so its state update path stays uncovered.
 * These focused tests verify the input reflects typed values and the
 * trimmed value is forwarded to onSubmit.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

describe('TicketForm - assignee input', () => {
  it('assignee 入力値が input の value に反映される', () => {
    const { unmount, container } = render(
      <TicketForm onSubmit={vi.fn()} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      const assigneeInput = q.getByTestId('assignee-input') as HTMLInputElement;
      expect(assigneeInput.value).toBe('');

      fireEvent.change(assigneeInput, { target: { value: 'Alice' } });
      expect(assigneeInput.value).toBe('Alice');
    } finally {
      unmount();
    }
  });

  it('入力された assignee は trim されて onSubmit に渡される', () => {
    const onSubmit = vi.fn();
    const { unmount, container } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Coverage title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Coverage description' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '   Bob   ' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledOnce();
      expect(onSubmit.mock.calls[0][0].assignee).toBe('Bob');
    } finally {
      unmount();
    }
  });

  it('assignee 未入力なら onSubmit の assignee は undefined', () => {
    const onSubmit = vi.fn();
    const { unmount, container } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Coverage title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Coverage description' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledOnce();
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });

  it('assignee が空白のみの場合 onSubmit の assignee は undefined', () => {
    const onSubmit = vi.fn();
    const { unmount, container } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Coverage title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Coverage description' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '     ' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledOnce();
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });
});
