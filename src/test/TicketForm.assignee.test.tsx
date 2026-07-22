/**
 * Additional unit tests for TicketForm component — assignee input.
 *
 * Covers TicketForm.tsx line 113 (setAssignee onChange handler), which is
 * not exercised by the property-based validation tests.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

describe('TicketForm - assignee input', () => {
  it('typing into the assignee input updates its displayed value', () => {
    const { container, unmount } = render(
      <TicketForm onSubmit={vi.fn()} onCancel={vi.fn()} />,
    );
    try {
      const assignee = within(container).getByTestId('assignee-input') as HTMLInputElement;
      expect(assignee.value).toBe('');

      fireEvent.change(assignee, { target: { value: 'Carol' } });
      expect(assignee.value).toBe('Carol');
    } finally {
      unmount();
    }
  });

  it('assignee value flows through submit as-is (trimmed)', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />,
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'A title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'A description' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '  Dave  ' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0]).toMatchObject({ assignee: 'Dave' });
    } finally {
      unmount();
    }
  });

  it('leaving assignee empty submits assignee as undefined', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />,
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'A title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'A description' } });
      // assignee left blank
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });

  it('whitespace-only assignee is treated as undefined', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />,
    );
    try {
      const q = within(container);
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

  it('changing assignee then clearing it results in empty value', () => {
    const { container, unmount } = render(
      <TicketForm onSubmit={vi.fn()} onCancel={vi.fn()} />,
    );
    try {
      const assignee = within(container).getByTestId('assignee-input') as HTMLInputElement;
      fireEvent.change(assignee, { target: { value: 'Erin' } });
      expect(assignee.value).toBe('Erin');
      fireEvent.change(assignee, { target: { value: '' } });
      expect(assignee.value).toBe('');
    } finally {
      unmount();
    }
  });
});
