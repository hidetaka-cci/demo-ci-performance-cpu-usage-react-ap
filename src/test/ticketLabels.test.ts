/**
 * Unit tests for label helpers in ticketUtils.
 *
 * These pure mapping functions are exported public API but were previously
 * only exercised incidentally through UI rendering. Direct unit tests catch
 * regressions in the label strings themselves (e.g. accidental renames or
 * missing enum keys) without requiring a full render.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { getPriorityLabel, getStatusLabel } from '../utils/ticketUtils';
import type { Priority, Status } from '../types/ticket';

const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

const STATUS_LABELS: Record<Status, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

const priorityArb = fc.constantFrom<Priority>('low', 'medium', 'high', 'critical');
const statusArb = fc.constantFrom<Status>('open', 'in_progress', 'resolved', 'closed');

describe('getPriorityLabel', () => {
  it.each(Object.entries(PRIORITY_LABELS))(
    'maps priority "%s" to label "%s"',
    (priority, expected) => {
      expect(getPriorityLabel(priority as Priority)).toBe(expected);
    }
  );

  it('returns a non-empty string for every valid priority', () => {
    fc.assert(
      fc.property(priorityArb, (priority) => {
        const label = getPriorityLabel(priority);
        expect(typeof label).toBe('string');
        expect(label.length).toBeGreaterThan(0);
      })
    );
  });

  it('is deterministic: repeated calls return the same label', () => {
    fc.assert(
      fc.property(priorityArb, (priority) => {
        expect(getPriorityLabel(priority)).toBe(getPriorityLabel(priority));
      })
    );
  });

  it('produces distinct labels for distinct priorities', () => {
    const labels = (['low', 'medium', 'high', 'critical'] as Priority[]).map(getPriorityLabel);
    expect(new Set(labels).size).toBe(labels.length);
  });
});

describe('getStatusLabel', () => {
  it.each(Object.entries(STATUS_LABELS))(
    'maps status "%s" to label "%s"',
    (status, expected) => {
      expect(getStatusLabel(status as Status)).toBe(expected);
    }
  );

  it('renders in_progress with a human-readable space, not the underscore', () => {
    // Guards against accidentally returning the raw enum key.
    const label = getStatusLabel('in_progress');
    expect(label).not.toContain('_');
    expect(label).toBe('In Progress');
  });

  it('returns a non-empty string for every valid status', () => {
    fc.assert(
      fc.property(statusArb, (status) => {
        const label = getStatusLabel(status);
        expect(typeof label).toBe('string');
        expect(label.length).toBeGreaterThan(0);
      })
    );
  });

  it('is deterministic: repeated calls return the same label', () => {
    fc.assert(
      fc.property(statusArb, (status) => {
        expect(getStatusLabel(status)).toBe(getStatusLabel(status));
      })
    );
  });

  it('produces distinct labels for distinct statuses', () => {
    const labels = (['open', 'in_progress', 'resolved', 'closed'] as Status[]).map(getStatusLabel);
    expect(new Set(labels).size).toBe(labels.length);
  });
});
