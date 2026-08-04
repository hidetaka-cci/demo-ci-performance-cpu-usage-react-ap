/**
 * Property-Based Tests for getPriorityLabel / getStatusLabel
 *
 * These label helpers in `ticketUtils.ts` were only exercised transitively
 * through component render tests. This file adds direct unit coverage so a
 * regression in the label mapping is caught without needing to boot the DOM.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { getPriorityLabel, getStatusLabel } from '../utils/ticketUtils';
import type { Priority, Status } from '../types/ticket';

const priorityArb = fc.constantFrom<Priority>('low', 'medium', 'high', 'critical');
const statusArb = fc.constantFrom<Status>('open', 'in_progress', 'resolved', 'closed');

const NUM_RUNS = 1000;

// ── getPriorityLabel ───────────────────────────────────────────────────────────

describe('getPriorityLabel', () => {
  it('returns the exact label for each known priority', () => {
    expect(getPriorityLabel('low')).toBe('Low');
    expect(getPriorityLabel('medium')).toBe('Medium');
    expect(getPriorityLabel('high')).toBe('High');
    expect(getPriorityLabel('critical')).toBe('Critical');
  });

  it('always returns a non-empty string', () => {
    fc.assert(
      fc.property(priorityArb, (priority) => {
        const label = getPriorityLabel(priority);
        expect(typeof label).toBe('string');
        expect(label.length).toBeGreaterThan(0);
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('returns a label whose lower-case form matches the priority key', () => {
    fc.assert(
      fc.property(priorityArb, (priority) => {
        expect(getPriorityLabel(priority).toLowerCase()).toBe(priority);
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('is deterministic — repeated calls with the same input return the same label', () => {
    fc.assert(
      fc.property(priorityArb, (priority) => {
        expect(getPriorityLabel(priority)).toBe(getPriorityLabel(priority));
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('each priority maps to a distinct label', () => {
    const labels = (['low', 'medium', 'high', 'critical'] as Priority[]).map(getPriorityLabel);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it('returned label starts with a capital letter', () => {
    fc.assert(
      fc.property(priorityArb, (priority) => {
        const label = getPriorityLabel(priority);
        expect(label[0]).toBe(label[0].toUpperCase());
      }),
      { numRuns: NUM_RUNS }
    );
  });
});

// ── getStatusLabel ─────────────────────────────────────────────────────────────

describe('getStatusLabel', () => {
  it('returns the exact label for each known status', () => {
    expect(getStatusLabel('open')).toBe('Open');
    expect(getStatusLabel('in_progress')).toBe('In Progress');
    expect(getStatusLabel('resolved')).toBe('Resolved');
    expect(getStatusLabel('closed')).toBe('Closed');
  });

  it('always returns a non-empty string', () => {
    fc.assert(
      fc.property(statusArb, (status) => {
        const label = getStatusLabel(status);
        expect(typeof label).toBe('string');
        expect(label.length).toBeGreaterThan(0);
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('is deterministic — repeated calls with the same input return the same label', () => {
    fc.assert(
      fc.property(statusArb, (status) => {
        expect(getStatusLabel(status)).toBe(getStatusLabel(status));
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('each status maps to a distinct label', () => {
    const labels = (['open', 'in_progress', 'resolved', 'closed'] as Status[]).map(getStatusLabel);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it('label for in_progress has no underscore and is human-readable', () => {
    const label = getStatusLabel('in_progress');
    expect(label).not.toContain('_');
    expect(label.trim()).toBe(label);
  });

  it('returned label starts with a capital letter', () => {
    fc.assert(
      fc.property(statusArb, (status) => {
        const label = getStatusLabel(status);
        expect(label[0]).toBe(label[0].toUpperCase());
      }),
      { numRuns: NUM_RUNS }
    );
  });
});
