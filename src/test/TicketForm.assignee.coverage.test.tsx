/**
 * Targeted coverage tests for TicketForm assignee handling.
 *
 * The PBT suite never types into the assignee input, so the
 * `onChange={e => setAssignee(e.target.value)}` handler and the
 * `assignee?.trim() || undefined` branch on submit are both
 * uncovered. These tests exercise:
 *   - assignee input updates the field value
 *   - a populated assignee is submitted with a trimmed string
 *   - an empty assignee submits `undefined`
 *   - a whitespace-only assignee also submits `undefined`
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

describe('TicketForm - assignee field', () => {
  it('typing into the assignee input updates its value', () => {
    const { container, unmount } = render(
      <TicketForm onSubmit={vi.fn()} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      const input = q.getByTestId('assignee-input') as HTMLInputElement;
      expect(input.value).toBe('');
      fireEvent.change(input, { target: { value: 'Alice' } });
      expect(input.value).toBe('Alice');
      fireEvent.change(input, { target: { value: 'Bob' } });
      expect(input.value).toBe('Bob');
    } finally {
      unmount();
    }
  });

  it('submitting with a populated assignee passes the trimmed value', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'My title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'My description' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '  Carol  ' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledOnce();
      const submitted = onSubmit.mock.calls[0][0];
      expect(submitted.assignee).toBe('Carol');
    } finally {
      unmount();
    }
  });

  it('submitting without filling assignee sends assignee=undefined', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'My title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'My description' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledOnce();
      const submitted = onSubmit.mock.calls[0][0];
      expect(submitted.assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });

  it('whitespace-only assignee is treated as undefined', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'My title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'My description' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '   \t  ' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledOnce();
      const submitted = onSubmit.mock.calls[0][0];
      expect(submitted.assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });
});
