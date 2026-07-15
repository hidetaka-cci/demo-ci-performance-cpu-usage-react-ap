/**
 * Unit tests targeting uncovered line in TicketForm.tsx:
 * - Line 113: onChange={e => setAssignee(e.target.value)}
 *
 * Existing PBT tests never populate the optional assignee input, so
 * the setAssignee handler and the trimmed-assignee submit branch are
 * uncovered. These tests exercise both.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';
import type { TicketFormData } from '../types/ticket';

describe('TicketForm - assignee input', () => {
  it('assignee 入力の value は onChange の後に更新される', () => {
    const { container, unmount } = render(
      <TicketForm onSubmit={() => {}} onCancel={() => {}} />
    );
    try {
      const assignee = within(container).getByTestId('assignee-input') as HTMLInputElement;
      expect(assignee.value).toBe('');
      fireEvent.change(assignee, { target: { value: 'Dana' } });
      expect(assignee.value).toBe('Dana');
    } finally {
      unmount();
    }
  });

  it('submit 時、入力された assignee が trim されて onSubmit に渡される', () => {
    const onSubmit = vi.fn<(data: TicketFormData) => void>();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={() => {}} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Set up alerts' } });
      fireEvent.change(q.getByTestId('description-input'), {
        target: { value: 'Add alerting for the ingestion pipeline.' },
      });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '   Erin   ' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].assignee).toBe('Erin');
    } finally {
      unmount();
    }
  });

  it('空白のみの assignee は undefined として submit される', () => {
    const onSubmit = vi.fn<(data: TicketFormData) => void>();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={() => {}} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Some title' } });
      fireEvent.change(q.getByTestId('description-input'), {
        target: { value: 'Some description body.' },
      });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '     ' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });
});
