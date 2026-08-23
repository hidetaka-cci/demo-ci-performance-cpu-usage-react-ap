/**
 * Coverage-oriented tests for TicketForm.
 *
 * The PBT suite does not exercise the assignee input, so the assignee
 * onChange handler is never invoked. These tests verify that:
 *   - Typing into the assignee input updates its value.
 *   - A trimmed assignee is passed through to onSubmit.
 *   - An assignee containing only whitespace is normalized to undefined.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

describe('TicketForm - assignee input', () => {
  it('typing into the assignee input updates its displayed value', () => {
    const { unmount, container } = render(
      <TicketForm onSubmit={vi.fn()} onCancel={vi.fn()} />
    );
    try {
      const assignee = within(container).getByTestId('assignee-input') as HTMLInputElement;
      expect(assignee.value).toBe('');

      fireEvent.change(assignee, { target: { value: 'Alice' } });
      expect(assignee.value).toBe('Alice');
    } finally {
      unmount();
    }
  });

  it('submits the trimmed assignee value with the ticket data', () => {
    const onSubmit = vi.fn();
    const { unmount, container } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Fix bug' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'It crashes' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '  Bob  ' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0]).toMatchObject({
        title: 'Fix bug',
        description: 'It crashes',
        assignee: 'Bob',
      });
    } finally {
      unmount();
    }
  });

  it('normalizes a whitespace-only assignee to undefined', () => {
    const onSubmit = vi.fn();
    const { unmount, container } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Fix bug' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'It crashes' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '   ' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });

  it('omits assignee when the input is left empty', () => {
    const onSubmit = vi.fn();
    const { unmount, container } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Fix bug' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'It crashes' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });
});
