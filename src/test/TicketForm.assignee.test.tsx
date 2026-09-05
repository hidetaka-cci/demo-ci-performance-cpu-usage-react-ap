/**
 * Tests for TicketForm assignee input change handler
 *
 * Covers the previously untested onChange path for the assignee field
 * and confirms the trim/undefined behavior when the form is submitted.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

describe('TicketForm - assignee input', () => {
  it('typing updates the assignee input value', () => {
    const { container, unmount } = render(
      <TicketForm onSubmit={vi.fn()} onCancel={vi.fn()} />
    );
    try {
      const assignee = within(container).getByTestId('assignee-input') as HTMLInputElement;
      fireEvent.change(assignee, { target: { value: 'Charlie' } });
      expect(assignee.value).toBe('Charlie');
    } finally {
      unmount();
    }
  });

  it('assignee value is passed trimmed to onSubmit', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'A title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'A description' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '  Dana  ' } });
      fireEvent.submit(q.getByTestId('ticket-form'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].assignee).toBe('Dana');
    } finally {
      unmount();
    }
  });

  it('empty assignee is submitted as undefined', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'A title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'A description' } });
      fireEvent.submit(q.getByTestId('ticket-form'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });

  it('whitespace-only assignee is submitted as undefined', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'A title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'A description' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '   ' } });
      fireEvent.submit(q.getByTestId('ticket-form'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });

  it('assignee input starts empty', () => {
    const { container, unmount } = render(
      <TicketForm onSubmit={vi.fn()} onCancel={vi.fn()} />
    );
    try {
      const assignee = within(container).getByTestId('assignee-input') as HTMLInputElement;
      expect(assignee.value).toBe('');
    } finally {
      unmount();
    }
  });
});
