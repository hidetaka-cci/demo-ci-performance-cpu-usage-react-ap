/**
 * Unit tests for TicketForm interactions left uncovered by TicketForm.pbt.
 *
 * The existing PBT suite never fires a change event on the assignee input,
 * leaving the corresponding onChange handler uncovered. It also doesn't
 * exercise the >200 character title validation branch. These tests fill both
 * gaps with deterministic inputs.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

describe('TicketForm - assignee input', () => {
  it('assignee 入力は controlled value として反映される', () => {
    const { container, unmount } = render(
      <TicketForm onSubmit={vi.fn()} onCancel={vi.fn()} />
    );
    try {
      const assignee = within(container).getByTestId('assignee-input') as HTMLInputElement;
      fireEvent.change(assignee, { target: { value: 'Alice' } });
      expect(assignee.value).toBe('Alice');
    } finally {
      unmount();
    }
  });

  it('assignee に入力した値が submit ペイロードに含まれる (trim される)', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'A title' } });
      fireEvent.change(q.getByTestId('description-input'), {
        target: { value: 'A description' },
      });
      fireEvent.change(q.getByTestId('assignee-input'), {
        target: { value: '  Carol  ' },
      });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].assignee).toBe('Carol');
    } finally {
      unmount();
    }
  });

  it('assignee が空白のみのときは submit ペイロードで undefined になる', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Title' } });
      fireEvent.change(q.getByTestId('description-input'), {
        target: { value: 'Description' },
      });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '   ' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });
});

describe('TicketForm - title length validation', () => {
  it('200文字を超える title では title-error を表示し onSubmit を呼ばない', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), {
        target: { value: 'a'.repeat(201) },
      });
      fireEvent.change(q.getByTestId('description-input'), {
        target: { value: 'description' },
      });
      fireEvent.click(q.getByTestId('submit-button'));

      const error = q.getByTestId('title-error');
      expect(error).toBeInTheDocument();
      expect(error.textContent).toMatch(/200/);
      expect(onSubmit).not.toHaveBeenCalled();
    } finally {
      unmount();
    }
  });

  it('200文字ちょうどの title は受理される', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), {
        target: { value: 'a'.repeat(200) },
      });
      fireEvent.change(q.getByTestId('description-input'), {
        target: { value: 'description' },
      });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].title.length).toBe(200);
    } finally {
      unmount();
    }
  });
});

describe('TicketForm - tags input', () => {
  it('空白だけのタグはフィルタされ、有効なタグだけ submit される', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'T' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'D' } });
      fireEvent.change(q.getByTestId('tags-input'), {
        target: { value: 'bug, , frontend ,  ,urgent' },
      });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].tags).toEqual(['bug', 'frontend', 'urgent']);
    } finally {
      unmount();
    }
  });
});
