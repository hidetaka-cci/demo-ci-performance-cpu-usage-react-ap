import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

function renderForm(onSubmit = vi.fn(), onCancel = vi.fn()) {
  const result = render(<TicketForm onSubmit={onSubmit} onCancel={onCancel} />);
  return { ...result, q: within(result.container) };
}

function fillRequiredFields(q: ReturnType<typeof within>, title = 'My Ticket', desc = 'Some description') {
  fireEvent.change(q.getByTestId('title-input'), { target: { value: title } });
  fireEvent.change(q.getByTestId('description-input'), { target: { value: desc } });
}

describe('TicketForm - assignee field', () => {
  it('assignee input is present in the form', () => {
    const { q } = renderForm();
    expect(q.getByTestId('assignee-input')).toBeInTheDocument();
  });

  it('typing in the assignee field updates its displayed value', () => {
    const { q } = renderForm();
    const input = q.getByTestId('assignee-input') as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'John Doe' } });

    expect(input.value).toBe('John Doe');
  });

  it('assignee is included in submitted data when provided', () => {
    const onSubmit = vi.fn();
    const { q } = renderForm(onSubmit);

    fillRequiredFields(q);
    fireEvent.change(q.getByTestId('assignee-input'), { target: { value: 'Alice' } });
    fireEvent.click(q.getByTestId('submit-button'));

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit.mock.calls[0][0].assignee).toBe('Alice');
  });

  it('assignee is undefined when field is left empty', () => {
    const onSubmit = vi.fn();
    const { q } = renderForm(onSubmit);

    fillRequiredFields(q);
    // leave assignee empty
    fireEvent.click(q.getByTestId('submit-button'));

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
  });

  it('whitespace-only assignee is treated as undefined on submit', () => {
    const onSubmit = vi.fn();
    const { q } = renderForm(onSubmit);

    fillRequiredFields(q);
    fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '   ' } });
    fireEvent.click(q.getByTestId('submit-button'));

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
  });

  it('assignee value is trimmed before submission', () => {
    const onSubmit = vi.fn();
    const { q } = renderForm(onSubmit);

    fillRequiredFields(q);
    fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '  Bob  ' } });
    fireEvent.click(q.getByTestId('submit-button'));

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit.mock.calls[0][0].assignee).toBe('Bob');
  });
});

describe('TicketForm - title length validation', () => {
  it('title longer than 200 characters shows a validation error', () => {
    const onSubmit = vi.fn();
    const { q } = renderForm(onSubmit);

    fireEvent.change(q.getByTestId('title-input'), { target: { value: 'a'.repeat(201) } });
    fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Some description' } });
    fireEvent.click(q.getByTestId('submit-button'));

    expect(q.getByTestId('title-error')).toBeInTheDocument();
    expect(q.getByTestId('title-error').textContent).toContain('200 characters');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('title of exactly 200 characters is valid', () => {
    const onSubmit = vi.fn();
    const { q } = renderForm(onSubmit);

    fireEvent.change(q.getByTestId('title-input'), { target: { value: 'a'.repeat(200) } });
    fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Some description' } });
    fireEvent.click(q.getByTestId('submit-button'));

    expect(q.queryByTestId('title-error')).not.toBeInTheDocument();
    expect(onSubmit).toHaveBeenCalledOnce();
  });
});
