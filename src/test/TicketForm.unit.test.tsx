import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';
import type { Priority } from '../types/ticket';

function renderForm() {
  const onSubmit = vi.fn();
  const onCancel = vi.fn();
  const result = render(<TicketForm onSubmit={onSubmit} onCancel={onCancel} />);
  return { ...result, q: within(result.container), onSubmit, onCancel };
}

function fillAndSubmit(
  q: ReturnType<typeof within>,
  { title = 'Test Title', description = 'Test description', priority }: {
    title?: string;
    description?: string;
    priority?: string;
  } = {}
) {
  fireEvent.change(q.getByTestId('title-input'), { target: { value: title } });
  fireEvent.change(q.getByTestId('description-input'), { target: { value: description } });
  if (priority) {
    fireEvent.change(q.getByTestId('priority-select'), { target: { value: priority } });
  }
  fireEvent.click(q.getByTestId('submit-button'));
}

describe('TicketForm - priority select', () => {
  it('submitted priority is "critical" after selecting critical', () => {
    const { q, onSubmit, unmount } = renderForm();
    fillAndSubmit(q, { priority: 'critical' });
    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit.mock.calls[0][0].priority).toBe('critical');
    unmount();
  });

  it('submitted priority is "high" after selecting high', () => {
    const { q, onSubmit, unmount } = renderForm();
    fillAndSubmit(q, { priority: 'high' });
    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit.mock.calls[0][0].priority).toBe('high');
    unmount();
  });

  it('submitted priority is "low" after selecting low', () => {
    const { q, onSubmit, unmount } = renderForm();
    fillAndSubmit(q, { priority: 'low' });
    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit.mock.calls[0][0].priority).toBe('low');
    unmount();
  });

  it('each priority option value produces the correct submitted priority', () => {
    const priorities: Priority[] = ['low', 'medium', 'high', 'critical'];
    for (const p of priorities) {
      const { q, onSubmit, unmount } = renderForm();
      fillAndSubmit(q, { priority: p });
      expect(onSubmit.mock.calls[0][0].priority).toBe(p);
      unmount();
    }
  });
});

describe('TicketForm - validation edge cases', () => {
  it('title longer than 200 chars shows error and blocks submit', () => {
    const { q, onSubmit, unmount } = renderForm();
    fireEvent.change(q.getByTestId('title-input'), { target: { value: 'a'.repeat(201) } });
    fireEvent.change(q.getByTestId('description-input'), { target: { value: 'desc' } });
    fireEvent.click(q.getByTestId('submit-button'));
    expect(q.getByTestId('title-error')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
    unmount();
  });

  it('whitespace-only title shows error and blocks submit', () => {
    const { q, onSubmit, unmount } = renderForm();
    fireEvent.change(q.getByTestId('title-input'), { target: { value: '   ' } });
    fireEvent.change(q.getByTestId('description-input'), { target: { value: 'desc' } });
    fireEvent.click(q.getByTestId('submit-button'));
    expect(q.getByTestId('title-error')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
    unmount();
  });

  it('assignee is passed through on submit when provided', () => {
    const { q, onSubmit, unmount } = renderForm();
    fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Title' } });
    fireEvent.change(q.getByTestId('description-input'), { target: { value: 'desc' } });
    fireEvent.change(q.getByTestId('assignee-input'), { target: { value: 'Alice' } });
    fireEvent.click(q.getByTestId('submit-button'));
    expect(onSubmit.mock.calls[0][0].assignee).toBe('Alice');
    unmount();
  });

  it('assignee is undefined when left blank', () => {
    const { q, onSubmit, unmount } = renderForm();
    fillAndSubmit(q);
    expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    unmount();
  });

  it('tags input is split by comma and trimmed', () => {
    const { q, onSubmit, unmount } = renderForm();
    fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Title' } });
    fireEvent.change(q.getByTestId('description-input'), { target: { value: 'desc' } });
    fireEvent.change(q.getByTestId('tags-input'), { target: { value: 'bug , frontend , urgent' } });
    fireEvent.click(q.getByTestId('submit-button'));
    expect(onSubmit.mock.calls[0][0].tags).toEqual(['bug', 'frontend', 'urgent']);
    unmount();
  });
});
