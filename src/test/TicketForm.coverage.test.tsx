/**
 * Coverage-targeted tests for TicketForm.
 *
 * Exercises the assignee input onChange handler (TicketForm.tsx line 113)
 * which the existing property-based tests do not touch.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

describe('TicketForm - assignee field', () => {
  it('typing into the assignee input updates the controlled value', () => {
    const { unmount, container } = render(
      <TicketForm onSubmit={vi.fn()} onCancel={vi.fn()} />,
    );
    try {
      const assignee = within(container).getByTestId(
        'assignee-input',
      ) as HTMLInputElement;
      fireEvent.change(assignee, { target: { value: 'Alice' } });
      expect(assignee.value).toBe('Alice');
    } finally {
      unmount();
    }
  });

  it('submitting with an assignee includes the trimmed value in onSubmit payload', () => {
    const onSubmit = vi.fn();
    const { unmount, container } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />,
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), {
        target: { value: 'A valid title' },
      });
      fireEvent.change(q.getByTestId('description-input'), {
        target: { value: 'A valid description' },
      });
      fireEvent.change(q.getByTestId('assignee-input'), {
        target: { value: '  Alice  ' },
      });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].assignee).toBe('Alice');
    } finally {
      unmount();
    }
  });

  it('submitting without an assignee leaves the payload assignee undefined', () => {
    const onSubmit = vi.fn();
    const { unmount, container } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />,
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), {
        target: { value: 'A valid title' },
      });
      fireEvent.change(q.getByTestId('description-input'), {
        target: { value: 'A valid description' },
      });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });

  it('a title longer than 200 characters is rejected with an error message', () => {
    const onSubmit = vi.fn();
    const { unmount, container } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />,
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), {
        target: { value: 'a'.repeat(201) },
      });
      fireEvent.change(q.getByTestId('description-input'), {
        target: { value: 'A valid description' },
      });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(q.getByTestId('title-error').textContent).toContain('200');
      expect(onSubmit).not.toHaveBeenCalled();
    } finally {
      unmount();
    }
  });
});
