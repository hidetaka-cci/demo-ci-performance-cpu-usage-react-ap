/**
 * Coverage-targeted tests for TicketForm assignee input.
 *
 * Targets previously-uncovered line in src/components/TicketForm.tsx:
 *   - line 113: onChange={e => setAssignee(e.target.value)}
 *
 * Also covers the two assignee-related branches in the submit path
 * (line 33): `assignee?.trim() || undefined` — trimmed value vs. undefined
 * for empty / whitespace-only input.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';
import type { TicketFormData } from '../types/ticket';

const fillRequired = (container: HTMLElement) => {
  const q = within(container);
  fireEvent.change(q.getByTestId('title-input'), { target: { value: 'A valid title' } });
  fireEvent.change(q.getByTestId('description-input'), { target: { value: 'A valid description' } });
};

describe('TicketForm - assignee input (coverage)', () => {
  it('typing into the assignee input updates the input value', () => {
    const { unmount, container } = render(
      <TicketForm onSubmit={vi.fn()} onCancel={vi.fn()} />
    );
    try {
      const input = within(container).getByTestId('assignee-input') as HTMLInputElement;
      expect(input.value).toBe('');

      fireEvent.change(input, { target: { value: 'Alice' } });
      expect(input.value).toBe('Alice');

      fireEvent.change(input, { target: { value: 'Bob' } });
      expect(input.value).toBe('Bob');
    } finally {
      unmount();
    }
  });

  it('submits the trimmed assignee value when provided', () => {
    const onSubmit = vi.fn<(data: TicketFormData) => void>();
    const { unmount, container } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fillRequired(container);
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '  Alice  ' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].assignee).toBe('Alice');
    } finally {
      unmount();
    }
  });

  it('submits assignee as undefined when the input is empty', () => {
    const onSubmit = vi.fn<(data: TicketFormData) => void>();
    const { unmount, container } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fillRequired(container);
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });

  it('submits assignee as undefined when the input is whitespace-only', () => {
    const onSubmit = vi.fn<(data: TicketFormData) => void>();
    const { unmount, container } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fillRequired(container);
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '   ' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });

  it('assignee value is preserved across other-field edits before submit', () => {
    const onSubmit = vi.fn<(data: TicketFormData) => void>();
    const { unmount, container } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      const assignee = q.getByTestId('assignee-input') as HTMLInputElement;
      fireEvent.change(assignee, { target: { value: 'Charlie' } });
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Desc' } });
      fireEvent.change(q.getByTestId('priority-select'), { target: { value: 'high' } });
      fireEvent.change(q.getByTestId('tags-input'), { target: { value: 'bug, ui' } });

      expect(assignee.value).toBe('Charlie');

      fireEvent.click(q.getByTestId('submit-button'));
      expect(onSubmit).toHaveBeenCalledTimes(1);
      const payload = onSubmit.mock.calls[0][0];
      expect(payload.assignee).toBe('Charlie');
      expect(payload.title).toBe('Title');
      expect(payload.description).toBe('Desc');
      expect(payload.priority).toBe('high');
      expect(payload.tags).toEqual(['bug', 'ui']);
    } finally {
      unmount();
    }
  });

  it('assignee input has no error affordance and does not block submit', () => {
    const onSubmit = vi.fn<(data: TicketFormData) => void>();
    const { unmount, container } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fillRequired(container);
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '!@#$%^&*()' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].assignee).toBe('!@#$%^&*()');
      expect(q.queryByTestId('title-error')).not.toBeInTheDocument();
      expect(q.queryByTestId('description-error')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });
});
