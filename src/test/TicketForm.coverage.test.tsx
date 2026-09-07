/**
 * Coverage tests for TicketForm inputs/handlers that the PBT suite does not
 * exercise:
 *   - assignee input `onChange` (TicketForm.tsx:113)
 *   - tags input `onChange`
 *   - priority select `onChange`
 *
 * The PBT tests submit whole forms but do not verify that typing into the
 * optional inputs updates their controlled values, so those handlers are
 * technically uncovered/underexercised.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

function renderForm() {
  const onSubmit = vi.fn();
  const onCancel = vi.fn();
  const result = render(<TicketForm onSubmit={onSubmit} onCancel={onCancel} />);
  return { ...result, q: within(result.container), onSubmit, onCancel };
}

describe('TicketForm - assignee input onChange', () => {
  it('updates the assignee input value when the user types', () => {
    const { unmount, q } = renderForm();
    try {
      const input = q.getByTestId('assignee-input') as HTMLInputElement;
      expect(input.value).toBe('');
      fireEvent.change(input, { target: { value: 'Alice' } });
      expect(input.value).toBe('Alice');
    } finally {
      unmount();
    }
  });

  it('propagates the assignee value into the submitted form data (trimmed)', () => {
    const { unmount, q, onSubmit } = renderForm();
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'A title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'A description' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '  Bob  ' } });
      fireEvent.submit(q.getByTestId('ticket-form'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0]).toMatchObject({
        title: 'A title',
        description: 'A description',
        assignee: 'Bob',
      });
    } finally {
      unmount();
    }
  });

  it('submits assignee as undefined when the input is left empty', () => {
    const { unmount, q, onSubmit } = renderForm();
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'A title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'A description' } });
      fireEvent.submit(q.getByTestId('ticket-form'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      const data = onSubmit.mock.calls[0][0];
      expect(data.assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });

  it('submits assignee as undefined when the input contains only whitespace', () => {
    const { unmount, q, onSubmit } = renderForm();
    try {
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
});

describe('TicketForm - priority select onChange', () => {
  it('updates the priority value when the user picks a different option', () => {
    const { unmount, q, onSubmit } = renderForm();
    try {
      const select = q.getByTestId('priority-select') as HTMLSelectElement;
      expect(select.value).toBe('medium');
      fireEvent.change(select, { target: { value: 'critical' } });
      expect(select.value).toBe('critical');

      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'A title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'A description' } });
      fireEvent.submit(q.getByTestId('ticket-form'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].priority).toBe('critical');
    } finally {
      unmount();
    }
  });
});

describe('TicketForm - title length validation', () => {
  it('rejects titles longer than 200 characters', () => {
    const { unmount, q, onSubmit } = renderForm();
    try {
      const longTitle = 'x'.repeat(201);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: longTitle } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'ok' } });
      fireEvent.submit(q.getByTestId('ticket-form'));

      expect(onSubmit).not.toHaveBeenCalled();
      const error = q.getByTestId('title-error');
      expect(error.textContent).toContain('200');
    } finally {
      unmount();
    }
  });
});
