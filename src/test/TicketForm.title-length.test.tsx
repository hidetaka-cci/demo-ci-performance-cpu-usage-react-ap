import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

const VALID_TITLE = 'A valid ticket title';
const VALID_DESC = 'A valid description for the ticket.';

function renderForm() {
  const onSubmit = vi.fn();
  const onCancel = vi.fn();
  const result = render(<TicketForm onSubmit={onSubmit} onCancel={onCancel} />);
  const q = within(result.container);
  return { onSubmit, onCancel, q, ...result };
}

describe('TicketForm - title length validation', () => {
  it('title of exactly 200 characters is accepted', () => {
    const { onSubmit, q, unmount } = renderForm();
    const title200 = 'a'.repeat(200);
    fireEvent.change(q.getByTestId('title-input'), { target: { value: title200 } });
    fireEvent.change(q.getByTestId('description-input'), { target: { value: VALID_DESC } });
    fireEvent.click(q.getByTestId('submit-button'));
    expect(onSubmit).toHaveBeenCalledOnce();
    expect(q.queryByTestId('title-error')).not.toBeInTheDocument();
    unmount();
  });

  it('title of 201 characters shows "Title must be 200 characters or less" error', () => {
    const { onSubmit, q, unmount } = renderForm();
    const title201 = 'a'.repeat(201);
    fireEvent.change(q.getByTestId('title-input'), { target: { value: title201 } });
    fireEvent.change(q.getByTestId('description-input'), { target: { value: VALID_DESC } });
    fireEvent.click(q.getByTestId('submit-button'));
    const error = q.getByTestId('title-error');
    expect(error).toBeInTheDocument();
    expect(error.textContent).toBe('Title must be 200 characters or less');
    expect(onSubmit).not.toHaveBeenCalled();
    unmount();
  });

  it('title of 500 characters shows the length error (not empty error)', () => {
    const { onSubmit, q, unmount } = renderForm();
    const title500 = 'x'.repeat(500);
    fireEvent.change(q.getByTestId('title-input'), { target: { value: title500 } });
    fireEvent.change(q.getByTestId('description-input'), { target: { value: VALID_DESC } });
    fireEvent.click(q.getByTestId('submit-button'));
    const error = q.getByTestId('title-error');
    expect(error.textContent).toBe('Title must be 200 characters or less');
    expect(onSubmit).not.toHaveBeenCalled();
    unmount();
  });

  it('title with leading/trailing spaces that trims to exactly 200 chars is accepted', () => {
    const { onSubmit, q, unmount } = renderForm();
    const title200WithSpaces = '  ' + 'a'.repeat(200) + '  ';
    fireEvent.change(q.getByTestId('title-input'), { target: { value: title200WithSpaces } });
    fireEvent.change(q.getByTestId('description-input'), { target: { value: VALID_DESC } });
    fireEvent.click(q.getByTestId('submit-button'));
    expect(onSubmit).toHaveBeenCalledOnce();
    unmount();
  });

  it('title with leading/trailing spaces that trims to 201 chars shows length error', () => {
    const { onSubmit, q, unmount } = renderForm();
    const title201WithSpaces = '  ' + 'a'.repeat(201) + '  ';
    fireEvent.change(q.getByTestId('title-input'), { target: { value: title201WithSpaces } });
    fireEvent.change(q.getByTestId('description-input'), { target: { value: VALID_DESC } });
    fireEvent.click(q.getByTestId('submit-button'));
    expect(q.getByTestId('title-error').textContent).toBe('Title must be 200 characters or less');
    expect(onSubmit).not.toHaveBeenCalled();
    unmount();
  });

  it('fixing a too-long title then resubmitting succeeds', () => {
    const { onSubmit, q, unmount } = renderForm();
    const longTitle = 'b'.repeat(201);
    const validTitle = 'Short valid title';

    fireEvent.change(q.getByTestId('title-input'), { target: { value: longTitle } });
    fireEvent.change(q.getByTestId('description-input'), { target: { value: VALID_DESC } });
    fireEvent.click(q.getByTestId('submit-button'));
    expect(q.getByTestId('title-error')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();

    fireEvent.change(q.getByTestId('title-input'), { target: { value: validTitle } });
    fireEvent.click(q.getByTestId('submit-button'));
    expect(onSubmit).toHaveBeenCalledOnce();
    unmount();
  });
});

describe('TicketForm - assignee input', () => {
  it('changing the assignee input updates the submitted data', () => {
    const { onSubmit, q, unmount } = renderForm();
    fireEvent.change(q.getByTestId('title-input'), { target: { value: VALID_TITLE } });
    fireEvent.change(q.getByTestId('description-input'), { target: { value: VALID_DESC } });
    fireEvent.change(q.getByTestId('assignee-input'), { target: { value: 'Bob' } });
    fireEvent.click(q.getByTestId('submit-button'));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ assignee: 'Bob' })
    );
    unmount();
  });

  it('empty assignee input submits with undefined assignee', () => {
    const { onSubmit, q, unmount } = renderForm();
    fireEvent.change(q.getByTestId('title-input'), { target: { value: VALID_TITLE } });
    fireEvent.change(q.getByTestId('description-input'), { target: { value: VALID_DESC } });
    fireEvent.click(q.getByTestId('submit-button'));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ assignee: undefined })
    );
    unmount();
  });

  it('whitespace-only assignee submits with undefined assignee', () => {
    const { onSubmit, q, unmount } = renderForm();
    fireEvent.change(q.getByTestId('title-input'), { target: { value: VALID_TITLE } });
    fireEvent.change(q.getByTestId('description-input'), { target: { value: VALID_DESC } });
    fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '   ' } });
    fireEvent.click(q.getByTestId('submit-button'));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ assignee: undefined })
    );
    unmount();
  });
});
