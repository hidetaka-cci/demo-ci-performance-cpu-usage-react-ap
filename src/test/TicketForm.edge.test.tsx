/**
 * Edge-case tests for TicketForm validation.
 *
 * The PBT suite covers happy-path validation and empty-field errors.
 * This file adds coverage for the title-too-long (> 200 chars) branch
 * which is a separate conditional in the validate() function.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, within } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

function renderForm() {
  const onSubmit = vi.fn();
  const onCancel = vi.fn();
  const result = render(<TicketForm onSubmit={onSubmit} onCancel={onCancel} />);
  const q = within(result.container);
  return { onSubmit, onCancel, q, ...result };
}

describe('TicketForm - title length edge cases', () => {
  it('title of exactly 200 chars is accepted', () => {
    const { onSubmit, q } = renderForm();
    const longTitle = 'a'.repeat(200);
    const validDesc = 'Some description';

    fireEvent.change(q.getByTestId('title-input'), { target: { value: longTitle } });
    fireEvent.change(q.getByTestId('description-input'), { target: { value: validDesc } });
    fireEvent.click(q.getByTestId('submit-button'));

    expect(q.queryByTestId('title-error')).not.toBeInTheDocument();
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('title of 201 chars shows length error and blocks submission', () => {
    const { onSubmit, q } = renderForm();
    const tooLongTitle = 'a'.repeat(201);
    const validDesc = 'Some description';

    fireEvent.change(q.getByTestId('title-input'), { target: { value: tooLongTitle } });
    fireEvent.change(q.getByTestId('description-input'), { target: { value: validDesc } });
    fireEvent.click(q.getByTestId('submit-button'));

    const errorEl = q.getByTestId('title-error');
    expect(errorEl).toBeInTheDocument();
    expect(errorEl.textContent).toMatch(/200/);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('whitespace-only title (non-empty but trims to empty) shows required error', () => {
    const { onSubmit, q } = renderForm();

    fireEvent.change(q.getByTestId('title-input'), { target: { value: '   ' } });
    fireEvent.change(q.getByTestId('description-input'), { target: { value: 'desc' } });
    fireEvent.click(q.getByTestId('submit-button'));

    const errorEl = q.getByTestId('title-error');
    expect(errorEl).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('whitespace-padded title within 200 trimmed chars is accepted', () => {
    const { onSubmit, q } = renderForm();
    const paddedTitle = '  valid title  ';

    fireEvent.change(q.getByTestId('title-input'), { target: { value: paddedTitle } });
    fireEvent.change(q.getByTestId('description-input'), { target: { value: 'desc' } });
    fireEvent.click(q.getByTestId('submit-button'));

    expect(q.queryByTestId('title-error')).not.toBeInTheDocument();
    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit.mock.calls[0][0].title).toBe('valid title');
  });

  it('both title and description empty shows title error', () => {
    const { onSubmit, q } = renderForm();

    fireEvent.click(q.getByTestId('submit-button'));

    expect(q.getByTestId('title-error')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe('TicketForm - assignee optional field', () => {
  it('empty assignee field results in undefined assignee in submitted data', () => {
    const { onSubmit, q } = renderForm();

    fireEvent.change(q.getByTestId('title-input'), { target: { value: 'My ticket' } });
    fireEvent.change(q.getByTestId('description-input'), { target: { value: 'A description' } });
    // leave assignee blank
    fireEvent.click(q.getByTestId('submit-button'));

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
  });

  it('whitespace-only assignee results in undefined', () => {
    const { onSubmit, q } = renderForm();

    fireEvent.change(q.getByTestId('title-input'), { target: { value: 'My ticket' } });
    fireEvent.change(q.getByTestId('description-input'), { target: { value: 'A description' } });
    fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '   ' } });
    fireEvent.click(q.getByTestId('submit-button'));

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
  });

  it('non-empty assignee is included in submitted data', () => {
    const { onSubmit, q } = renderForm();

    fireEvent.change(q.getByTestId('title-input'), { target: { value: 'My ticket' } });
    fireEvent.change(q.getByTestId('description-input'), { target: { value: 'A description' } });
    fireEvent.change(q.getByTestId('assignee-input'), { target: { value: 'Alice' } });
    fireEvent.click(q.getByTestId('submit-button'));

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit.mock.calls[0][0].assignee).toBe('Alice');
  });
});
