/**
 * Focused tests for TicketForm assignee input
 *
 * Covers line 113 of TicketForm.tsx: the assignee input's onChange handler,
 * plus the assignee-handling branch in handleSubmit (empty string collapses
 * to undefined; a value is trimmed).
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TicketForm } from '../components/TicketForm';

describe('TicketForm - assignee input', () => {
  it('typing into the assignee input updates its value', async () => {
    const { container, unmount } = render(
      <TicketForm onSubmit={vi.fn()} onCancel={vi.fn()} />
    );
    try {
      const input = within(container).getByTestId('assignee-input') as HTMLInputElement;
      await userEvent.type(input, 'Alice');
      expect(input.value).toBe('Alice');
    } finally {
      unmount();
    }
  });

  it('trims the assignee value before submitting', async () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      await userEvent.type(q.getByTestId('title-input'), 'Some title');
      await userEvent.type(q.getByTestId('description-input'), 'Some description');
      // Whitespace-padded assignee — should be trimmed to "Bob"
      await userEvent.type(q.getByTestId('assignee-input'), '   Bob   ');
      await userEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      const payload = onSubmit.mock.calls[0][0];
      expect(payload.assignee).toBe('Bob');
    } finally {
      unmount();
    }
  });

  it('sends assignee as undefined when the field is left blank', async () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      await userEvent.type(q.getByTestId('title-input'), 'Ticket title');
      await userEvent.type(q.getByTestId('description-input'), 'Ticket description');
      await userEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      const payload = onSubmit.mock.calls[0][0];
      expect(payload.assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });

  it('sends assignee as undefined when the field is only whitespace', async () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      await userEvent.type(q.getByTestId('title-input'), 'Whitespace assignee');
      await userEvent.type(q.getByTestId('description-input'), 'Details');
      await userEvent.type(q.getByTestId('assignee-input'), '   ');
      await userEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      const payload = onSubmit.mock.calls[0][0];
      expect(payload.assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });
});

describe('TicketForm - title length validation', () => {
  it('rejects titles longer than 200 characters', async () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      const longTitle = 'a'.repeat(201);
      await userEvent.type(q.getByTestId('title-input'), longTitle);
      await userEvent.type(q.getByTestId('description-input'), 'valid description');
      await userEvent.click(q.getByTestId('submit-button'));

      const err = q.getByTestId('title-error');
      expect(err.textContent).toContain('200 characters');
      expect(onSubmit).not.toHaveBeenCalled();
    } finally {
      unmount();
    }
  });
});
