/**
 * Tests for TicketForm assignee input field.
 *
 * Targets the uncovered path in TicketForm.tsx line 113:
 *   onChange={e => setAssignee(e.target.value)}
 *
 * The existing PBT tests never interact with the assignee input, so
 * its onChange handler and its effect on submitted data are untested.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

function renderForm() {
  const onSubmit = vi.fn();
  const onCancel = vi.fn();
  const result = render(<TicketForm onSubmit={onSubmit} onCancel={onCancel} />);
  return { ...result, onSubmit, onCancel, q: within(result.container) };
}

describe('TicketForm - assignee field', () => {
  it('assignee input is present in the form', () => {
    const { q, unmount } = renderForm();
    try {
      expect(q.getByTestId('assignee-input')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('typing in the assignee input updates its value', () => {
    const { q, unmount } = renderForm();
    try {
      const input = q.getByTestId('assignee-input') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'Alice' } });
      expect(input.value).toBe('Alice');
    } finally {
      unmount();
    }
  });

  it('submitted data includes the trimmed assignee when provided', () => {
    const { q, onSubmit, unmount } = renderForm();
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'My ticket' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Some description' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '  Bob  ' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledOnce();
      expect(onSubmit.mock.calls[0][0].assignee).toBe('Bob');
    } finally {
      unmount();
    }
  });

  it('submitted data has no assignee when the assignee input is left empty', () => {
    const { q, onSubmit, unmount } = renderForm();
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'My ticket' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Some description' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledOnce();
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });

  it('submitted data has no assignee when the assignee input contains only whitespace', () => {
    const { q, onSubmit, unmount } = renderForm();
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'My ticket' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Some description' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '   ' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledOnce();
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });

  it('changing assignee multiple times uses the last value', () => {
    const { q, onSubmit, unmount } = renderForm();
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'My ticket' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Some description' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: 'Alice' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: 'Charlie' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledOnce();
      expect(onSubmit.mock.calls[0][0].assignee).toBe('Charlie');
    } finally {
      unmount();
    }
  });
});
