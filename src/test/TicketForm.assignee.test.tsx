/**
 * Unit tests for TicketForm assignee field interaction.
 *
 * Covers the previously untested path in TicketForm.tsx:
 *   - line 113: onChange={e => setAssignee(e.target.value)}
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

function renderForm(onSubmit = vi.fn(), onCancel = vi.fn()) {
  const result = render(<TicketForm onSubmit={onSubmit} onCancel={onCancel} />);
  return { ...result, q: within(result.container) };
}

describe('TicketForm - assignee field', () => {
  it('typing in the assignee input updates its displayed value', () => {
    const { q, unmount } = renderForm();
    try {
      const input = q.getByTestId('assignee-input') as HTMLInputElement;
      // covers TicketForm.tsx line 113
      fireEvent.change(input, { target: { value: 'Bob' } });
      expect(input.value).toBe('Bob');
    } finally {
      unmount();
    }
  });

  it('submitting with a non-empty assignee passes the trimmed value to onSubmit', () => {
    const onSubmit = vi.fn();
    const { q, unmount } = renderForm(onSubmit);
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Some title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Some description' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '  Charlie  ' } });
      fireEvent.click(q.getByTestId('submit-button'));
      expect(onSubmit).toHaveBeenCalledOnce();
      expect(onSubmit.mock.calls[0][0].assignee).toBe('Charlie');
    } finally {
      unmount();
    }
  });

  it('submitting with a blank assignee passes undefined to onSubmit', () => {
    const onSubmit = vi.fn();
    const { q, unmount } = renderForm(onSubmit);
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Desc' } });
      // leave assignee empty
      fireEvent.click(q.getByTestId('submit-button'));
      expect(onSubmit).toHaveBeenCalledOnce();
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });

  it('title too long (>200 chars) shows validation error and blocks submit', () => {
    const onSubmit = vi.fn();
    const { q, unmount } = renderForm(onSubmit);
    try {
      const longTitle = 'a'.repeat(201);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: longTitle } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Desc' } });
      fireEvent.click(q.getByTestId('submit-button'));
      expect(q.getByTestId('title-error')).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    } finally {
      unmount();
    }
  });
});
