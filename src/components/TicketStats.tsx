interface Stats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  critical: number;
}

interface TicketStatsProps {
  stats: Stats;
}

export function TicketStats({ stats }: TicketStatsProps) {
  const items = [
    { label: 'Total', value: stats.total, color: '#374151', testId: 'stat-total' },
    { label: 'Open', value: stats.open, color: '#3b82f6', testId: 'stat-open' },
    { label: 'In Progress', value: stats.inProgress, color: '#8b5cf6', testId: 'stat-in-progress' },
    { label: 'Resolved', value: stats.resolved, color: '#10b981', testId: 'stat-resolved' },
    { label: 'Closed', value: stats.closed, color: '#6b7280', testId: 'stat-closed' },
    { label: 'Critical', value: stats.critical, color: '#dc2626', testId: 'stat-critical' },
  ];

  return (
    <div
      data-testid="ticket-stats"
      style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}
    >
      {items.map(item => (
        <div
          key={item.label}
          data-testid={item.testId}
          style={{
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '12px 16px',
            minWidth: '90px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '24px', fontWeight: 700, color: item.color }}>{item.value}</div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{item.label}</div>
        </div>
      ))}
    </div>
  );
}
