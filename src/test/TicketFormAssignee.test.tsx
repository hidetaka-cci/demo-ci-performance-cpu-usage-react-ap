/**
 * TicketForm - assignee + tags field tests.
 *
 * The existing PBT suite never types into the assignee input, leaving the
 * setAssignee handler uncovered, and only spot-checks the tags split path.
 * These deterministic tests cover both fields end-to-end through onSubmit.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

describe('TicketForm assignee handling', () => {
  it('assignee 入力は state に反映され、trim された値で onSubmit に渡る', () => {
    const onSubmit = vi.fn();
    const { container } = render(<TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />);
    const q = within(container);

    fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Investigate latency' } });
    fireEvent.change(q.getByTestId('description-input'), { target: { value: 'p95 spiked overnight' } });
    fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '  Eve  ' } });

    // assignee input が制御コンポーネントとして正しく state を反映していること。
    expect((q.getByTestId('assignee-input') as HTMLInputElement).value).toBe('  Eve  ');

    fireEvent.click(q.getByTestId('submit-button'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      title: 'Investigate latency',
      description: 'p95 spiked overnight',
      assignee: 'Eve',
    });
  });

  it('assignee が空文字のとき onSubmit には undefined が渡る', () => {
    const onSubmit = vi.fn();
    const { container } = render(<TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />);
    const q = within(container);

    fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Ship MVP' } });
    fireEvent.change(q.getByTestId('description-input'), { target: { value: 'finalise launch checklist' } });
    fireEvent.click(q.getByTestId('submit-button'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
  });

  it('assignee が空白のみのときも onSubmit には undefined が渡る', () => {
    const onSubmit = vi.fn();
    const { container } = render(<TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />);
    const q = within(container);

    fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Rotate keys' } });
    fireEvent.change(q.getByTestId('description-input'), { target: { value: 'quarterly rotation' } });
    fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '   ' } });
    fireEvent.click(q.getByTestId('submit-button'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
  });

  it('長すぎるタイトルでは title エラーが表示され onSubmit は呼ばれない', () => {
    const onSubmit = vi.fn();
    const { container } = render(<TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />);
    const q = within(container);

    fireEvent.change(q.getByTestId('title-input'), { target: { value: 'a'.repeat(201) } });
    fireEvent.change(q.getByTestId('description-input'), { target: { value: 'desc' } });
    fireEvent.click(q.getByTestId('submit-button'));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(q.getByTestId('title-error').textContent).toMatch(/200 characters or less/);
  });

  it('priority select の変更は onSubmit のペイロードに反映される', () => {
    const onSubmit = vi.fn();
    const { container } = render(<TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />);
    const q = within(container);

    fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Triage backlog' } });
    fireEvent.change(q.getByTestId('description-input'), { target: { value: 'reduce open count' } });
    fireEvent.change(q.getByTestId('priority-select'), { target: { value: 'critical' } });
    fireEvent.click(q.getByTestId('submit-button'));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ priority: 'critical' })
    );
  });

  it('tags はカンマで分割され、空セグメントは除外される', () => {
    const onSubmit = vi.fn();
    const { container } = render(<TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />);
    const q = within(container);

    fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Doc fixups' } });
    fireEvent.change(q.getByTestId('description-input'), { target: { value: 'misc cleanup' } });
    fireEvent.change(q.getByTestId('tags-input'), {
      target: { value: '  alpha , , beta , gamma  ,, ' },
    });
    fireEvent.click(q.getByTestId('submit-button'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0].tags).toEqual(['alpha', 'beta', 'gamma']);
  });
});
