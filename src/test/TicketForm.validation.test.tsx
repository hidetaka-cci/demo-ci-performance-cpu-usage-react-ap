import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

function renderForm(onSubmit = vi.fn(), onCancel = vi.fn()) {
  const result = render(<TicketForm onSubmit={onSubmit} onCancel={onCancel} />);
  return { ...result, q: within(result.container) };
}

describe('TicketForm - title length validation', () => {
  it('shows title error when title exceeds 200 characters', () => {
    const onSubmit = vi.fn();
    const { q } = renderForm(onSubmit);
    const longTitle = 'a'.repeat(201);
    fireEvent.change(q.getByTestId('title-input'), { target: { value: longTitle } });
    fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Valid description' } });
    fireEvent.click(q.getByTestId('submit-button'));

    expect(q.getByTestId('title-error')).toBeInTheDocument();
    expect(q.getByTestId('title-error').textContent).toContain('200');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('accepts title that is exactly 200 characters', () => {
    const onSubmit = vi.fn();
    const { q } = renderForm(onSubmit);
    const exactTitle = 'a'.repeat(200);
    fireEvent.change(q.getByTestId('title-input'), { target: { value: exactTitle } });
    fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Valid description' } });
    fireEvent.click(q.getByTestId('submit-button'));

    expect(q.queryByTestId('title-error')).not.toBeInTheDocument();
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('shows title required error when title is blank spaces only', () => {
    const onSubmit = vi.fn();
    const { q } = renderForm(onSubmit);
    fireEvent.change(q.getByTestId('title-input'), { target: { value: '   ' } });
    fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Valid description' } });
    fireEvent.click(q.getByTestId('submit-button'));

    expect(q.getByTestId('title-error')).toBeInTheDocument();
    expect(q.getByTestId('title-error').textContent).toContain('required');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows description required error when description is blank spaces only', () => {
    const onSubmit = vi.fn();
    const { q } = renderForm(onSubmit);
    fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Valid title' } });
    fireEvent.change(q.getByTestId('description-input'), { target: { value: '   ' } });
    fireEvent.click(q.getByTestId('submit-button'));

    expect(q.getByTestId('description-error')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows both title and description errors when both are empty', () => {
    const onSubmit = vi.fn();
    const { q } = renderForm(onSubmit);
    fireEvent.click(q.getByTestId('submit-button'));

    expect(q.getByTestId('title-error')).toBeInTheDocument();
    expect(q.getByTestId('description-error')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe('TicketForm - assignee and tags submission', () => {
  it('submits with assignee when provided', () => {
    const onSubmit = vi.fn();
    const { q } = renderForm(onSubmit);
    fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Test' } });
    fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Desc' } });
    fireEvent.change(q.getByTestId('assignee-input'), { target: { value: 'Alice' } });
    fireEvent.click(q.getByTestId('submit-button'));

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit.mock.calls[0][0].assignee).toBe('Alice');
  });

  it('submits undefined assignee when assignee input is blank', () => {
    const onSubmit = vi.fn();
    const { q } = renderForm(onSubmit);
    fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Test' } });
    fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Desc' } });
    fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '   ' } });
    fireEvent.click(q.getByTestId('submit-button'));

    expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
  });

  it('submits parsed tags from comma-separated input', () => {
    const onSubmit = vi.fn();
    const { q } = renderForm(onSubmit);
    fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Test' } });
    fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Desc' } });
    fireEvent.change(q.getByTestId('tags-input'), { target: { value: 'bug, frontend, urgent' } });
    fireEvent.click(q.getByTestId('submit-button'));

    expect(onSubmit.mock.calls[0][0].tags).toEqual(['bug', 'frontend', 'urgent']);
  });

  it('submits empty tags array when tags input is empty', () => {
    const onSubmit = vi.fn();
    const { q } = renderForm(onSubmit);
    fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Test' } });
    fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Desc' } });
    fireEvent.click(q.getByTestId('submit-button'));

    expect(onSubmit.mock.calls[0][0].tags).toEqual([]);
  });

  it('submits selected priority', () => {
    const onSubmit = vi.fn();
    const { q } = renderForm(onSubmit);
    fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Test' } });
    fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Desc' } });
    fireEvent.change(q.getByTestId('priority-select'), { target: { value: 'critical' } });
    fireEvent.click(q.getByTestId('submit-button'));

    expect(onSubmit.mock.calls[0][0].priority).toBe('critical');
  });
});

describe('TicketForm - form state management', () => {
  it('priority select defaults to medium', () => {
    const { q } = renderForm();
    const select = q.getByTestId('priority-select') as HTMLSelectElement;
    expect(select.value).toBe('medium');
  });

  it('title input reflects typed value', () => {
    const { q } = renderForm();
    fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Hello' } });
    expect((q.getByTestId('title-input') as HTMLInputElement).value).toBe('Hello');
  });

  it('description input reflects typed value', () => {
    const { q } = renderForm();
    fireEvent.change(q.getByTestId('description-input'), { target: { value: 'My description' } });
    expect((q.getByTestId('description-input') as HTMLTextAreaElement).value).toBe('My description');
  });
});
