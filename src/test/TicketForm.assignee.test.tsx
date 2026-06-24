/**
 * Tests covering the TicketForm assignee input.
 *
 * The existing PBT suite never types into the assignee field, leaving
 * TicketForm.tsx line 113 (setAssignee onChange) and the
 * `assignee?.trim() || undefined` submission branch uncovered.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';
import type { TicketFormData } from '../types/ticket';

describe('TicketForm - assignee input', () => {
  it('typing into the assignee field updates the input value', () => {
    const { container } = render(
      <TicketForm onSubmit={() => {}} onCancel={() => {}} />
    );
    const q = within(container);
    const assigneeInput = q.getByTestId('assignee-input') as HTMLInputElement;

    expect(assigneeInput.value).toBe('');
    fireEvent.change(assigneeInput, { target: { value: 'Charlie' } });
    expect(assigneeInput.value).toBe('Charlie');
  });

  it('submitting with an assignee includes the trimmed value in onSubmit payload', () => {
    const onSubmit = vi.fn();
    const { container } = render(
      <TicketForm onSubmit={onSubmit} onCancel={() => {}} />
    );
    const q = within(container);

    fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Bug A' } });
    fireEvent.change(q.getByTestId('description-input'), {
      target: { value: 'Reproduces consistently.' },
    });
    fireEvent.change(q.getByTestId('assignee-input'), {
      target: { value: '  Dana  ' },
    });
    fireEvent.click(q.getByTestId('submit-button'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const payload = onSubmit.mock.calls[0][0] as TicketFormData;
    expect(payload.assignee).toBe('Dana');
    expect(payload.title).toBe('Bug A');
    expect(payload.description).toBe('Reproduces consistently.');
  });

  it('submitting with a blank/whitespace assignee passes undefined (not an empty string)', () => {
    const onSubmit = vi.fn();
    const { container } = render(
      <TicketForm onSubmit={onSubmit} onCancel={() => {}} />
    );
    const q = within(container);

    fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Bug B' } });
    fireEvent.change(q.getByTestId('description-input'), {
      target: { value: 'Edge case.' },
    });
    fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '   ' } });
    fireEvent.click(q.getByTestId('submit-button'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const payload = onSubmit.mock.calls[0][0] as TicketFormData;
    expect(payload.assignee).toBeUndefined();
  });

  it('submitting without ever touching the assignee field passes undefined', () => {
    const onSubmit = vi.fn();
    const { container } = render(
      <TicketForm onSubmit={onSubmit} onCancel={() => {}} />
    );
    const q = within(container);

    fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Bug C' } });
    fireEvent.change(q.getByTestId('description-input'), {
      target: { value: 'Default assignee path.' },
    });
    fireEvent.click(q.getByTestId('submit-button'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const payload = onSubmit.mock.calls[0][0] as TicketFormData;
    expect(payload.assignee).toBeUndefined();
  });
});
