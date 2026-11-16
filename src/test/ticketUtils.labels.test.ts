/**
 * Unit tests for getPriorityLabel and getStatusLabel
 *
 * These pure functions are exercised indirectly by component rendering tests,
 * but have no direct unit coverage. This file covers them explicitly so that
 * regressions in label text are caught at the utility layer.
 */

import { describe, it, expect } from 'vitest';
import { getPriorityLabel, getStatusLabel } from '../utils/ticketUtils';
import type { Priority, Status } from '../types/ticket';

describe('getPriorityLabel', () => {
  const cases: Array<[Priority, string]> = [
    ['low', 'Low'],
    ['medium', 'Medium'],
    ['high', 'High'],
    ['critical', 'Critical'],
  ];

  it.each(cases)('priority "%s" returns "%s"', (priority, expected) => {
    expect(getPriorityLabel(priority)).toBe(expected);
  });

  it('returns a non-empty string for every valid priority', () => {
    const priorities: Priority[] = ['low', 'medium', 'high', 'critical'];
    priorities.forEach(p => {
      expect(getPriorityLabel(p).length).toBeGreaterThan(0);
    });
  });
});

describe('getStatusLabel', () => {
  const cases: Array<[Status, string]> = [
    ['open', 'Open'],
    ['in_progress', 'In Progress'],
    ['resolved', 'Resolved'],
    ['closed', 'Closed'],
  ];

  it.each(cases)('status "%s" returns "%s"', (status, expected) => {
    expect(getStatusLabel(status)).toBe(expected);
  });

  it('returns a non-empty string for every valid status', () => {
    const statuses: Status[] = ['open', 'in_progress', 'resolved', 'closed'];
    statuses.forEach(s => {
      expect(getStatusLabel(s).length).toBeGreaterThan(0);
    });
  });

  it('in_progress label contains a space (human-readable)', () => {
    expect(getStatusLabel('in_progress')).toContain(' ');
  });
});
