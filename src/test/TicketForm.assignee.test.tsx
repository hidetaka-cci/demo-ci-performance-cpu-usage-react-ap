/**
 * Coverage-focused tests for the TicketForm assignee input.
 *
 * The existing PBT suite does not type into the assignee field, so the
 * onChange handler at line 113 in TicketForm.tsx is uncovered. These tests
 * exercise the field and confirm the trimmed value ends up on the submitted
 * form data (or is omitted when only whitespace was typed).
 */

import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, within } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

function fillRequired(container: HTMLElement) {
  const q = within(container);
  fireEvent.change(q.getByTestId('title-input'), { target: { value: 'A title' } });
  fireEvent.change(q.getByTestId('description-input'), { target: { value: 'A description' } });
}

describe('TicketForm - assignee input', () => {
  it('updates the assignee input value as the user types', () => {
    const { container, unmount } = render(
      <TicketForm onSubmit={vi.fn()} onCancel={vi.fn()} />
    );
    try {
      const input = within(container).getByTestId('assignee-input') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'Alice' } });
      expect(input.value).toBe('Alice');
    } finally {
      unmount();
    }
  });

  it('submits the trimmed assignee value', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fillRequired(container);
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '   Bob   ' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      const submitted = onSubmit.mock.calls[0][0];
      expect(submitted.assignee).toBe('Bob');
    } finally {
      unmount();
    }
  });

  it('omits the assignee entirely when only whitespace is typed', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fillRequired(container);
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '   ' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      const submitted = onSubmit.mock.calls[0][0];
      expect(submitted.assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });

  it('omits the assignee entirely when the field is left blank', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      fillRequired(container);
      fireEvent.click(within(container).getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      const submitted = onSubmit.mock.calls[0][0];
      expect(submitted.assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });
});
