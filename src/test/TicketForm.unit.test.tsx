/**
 * Unit tests for TicketForm's uncovered validation paths and form fields.
 *
 * The PBT suite uses validTitleArb with maxLength:200 and never fills the
 * assignee field, leaving uncovered:
 *   - TicketForm.tsx: `title.trim().length > 200` branch in validate()
 *   - TicketForm.tsx: assignee onChange handler (line ~111-113 in source)
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

function renderForm() {
  const onSubmit = vi.fn();
  const onCancel = vi.fn();
  const result = render(<TicketForm onSubmit={onSubmit} onCancel={onCancel} />);
  const q = within(result.container);
  return { ...result, q, onSubmit, onCancel };
}

describe('TicketForm - title length validation', () => {
  it('title longer than 200 characters shows a length error and blocks submit', () => {
    const { q, onSubmit } = renderForm();

    const longTitle = 'a'.repeat(201);
    fireEvent.change(q.getByTestId('title-input'), { target: { value: longTitle } });
    fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Valid description' } });
    fireEvent.click(q.getByTestId('submit-button'));

    expect(q.getByTestId('title-error')).toBeInTheDocument();
    expect(q.getByTestId('title-error').textContent).toMatch(/200/);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('title of exactly 200 characters is valid and submits', () => {
    const { q, onSubmit } = renderForm();

    const exactTitle = 'x'.repeat(200);
    fireEvent.change(q.getByTestId('title-input'), { target: { value: exactTitle } });
    fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Valid description' } });
    fireEvent.click(q.getByTestId('submit-button'));

    expect(q.queryByTestId('title-error')).not.toBeInTheDocument();
    expect(onSubmit).toHaveBeenCalledOnce();
  });
});

describe('TicketForm - assignee field', () => {
  it('typing in assignee field updates the submitted assignee value', () => {
    const { q, onSubmit } = renderForm();

    fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Fix bug' } });
    fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Details here' } });
    fireEvent.change(q.getByTestId('assignee-input'), { target: { value: 'Alice' } });
    fireEvent.click(q.getByTestId('submit-button'));

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit.mock.calls[0][0].assignee).toBe('Alice');
  });

  it('whitespace-only assignee is treated as undefined', () => {
    const { q, onSubmit } = renderForm();

    fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Fix bug' } });
    fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Details here' } });
    fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '   ' } });
    fireEvent.click(q.getByTestId('submit-button'));

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
  });

  it('assignee input with leading/trailing spaces is trimmed', () => {
    const { q, onSubmit } = renderForm();

    fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Fix bug' } });
    fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Details here' } });
    fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '  Bob  ' } });
    fireEvent.click(q.getByTestId('submit-button'));

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit.mock.calls[0][0].assignee).toBe('Bob');
  });
});
