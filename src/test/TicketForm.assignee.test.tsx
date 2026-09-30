/**
 * TicketForm - assignee field & title-length validation coverage
 *
 * The main PBT suite never types into the assignee field and never exceeds
 * the 200-character title limit, so those branches in TicketForm.tsx go
 * untested. These focused tests cover them.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

describe('TicketForm - assignee input', () => {
  it('typing into the assignee field is echoed back and forwarded on submit', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />,
    );
    try {
      const q = within(container);
      const assignee = q.getByTestId('assignee-input') as HTMLInputElement;

      fireEvent.change(assignee, { target: { value: '  Dana  ' } });
      expect(assignee.value).toBe('  Dana  ');

      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'A title' } });
      fireEvent.change(q.getByTestId('description-input'), {
        target: { value: 'A description' },
      });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledOnce();
      // assignee is trimmed by the form before dispatch
      expect(onSubmit.mock.calls[0][0].assignee).toBe('Dana');
    } finally {
      unmount();
    }
  });

  it('an assignee of only whitespace is normalized to undefined', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />,
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '   ' } });
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'title' } });
      fireEvent.change(q.getByTestId('description-input'), {
        target: { value: 'desc' },
      });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledOnce();
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });
});

describe('TicketForm - title length validation', () => {
  it('rejects titles longer than 200 characters', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />,
    );
    try {
      const q = within(container);
      const longTitle = 'a'.repeat(201);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: longTitle } });
      fireEvent.change(q.getByTestId('description-input'), {
        target: { value: 'a description' },
      });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).not.toHaveBeenCalled();
      const err = q.getByTestId('title-error');
      expect(err).toBeInTheDocument();
      expect(err.textContent).toMatch(/200/);
    } finally {
      unmount();
    }
  });

  it('accepts titles exactly at the 200-character limit', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />,
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), {
        target: { value: 'a'.repeat(200) },
      });
      fireEvent.change(q.getByTestId('description-input'), {
        target: { value: 'a description' },
      });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledOnce();
      expect(onSubmit.mock.calls[0][0].title).toHaveLength(200);
    } finally {
      unmount();
    }
  });
});
