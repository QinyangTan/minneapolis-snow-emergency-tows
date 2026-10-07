// FP1 proposal snapshot (October 5, 2026). NOT independently regenerated.
export const preliminaryDays = [
  { day: 1, count: 1255 },
  { day: 2, count: 2222 },
  { day: 3, count: 1946 }
];
export const preliminaryEvents = [
  { id: 'Dover', season: '2022/23', total: 631 },
  { id: 'Jane', season: '2022/23', total: 584 },
  { id: 'Lourdes', season: '2022/23', total: 435 },
  { id: 'Northrop', season: '2022/23', total: 465 },
  { id: 'Victory 1', season: '2022/23', total: 506 },
  { id: 'Howard', season: '2024/25', total: 665 },
  { id: 'Bridge', season: '2025/26', total: 852 },
  { id: 'Glenwood', season: '2025/26', total: 719 },
  { id: 'Jefferson', season: '2025/26', total: 566 }
];
export type DayRow = { day: number; count: number };
export type EventRow = { id: string; season: string; total: number; days?: DayRow[] };
export type Summary = {
  status: string;
  generated_at_utc: string;
  total: number;
  unassigned_neighborhood_count?: number;
  days: DayRow[];
  events: EventRow[];
  neighborhoods: {
    name: string; total: number; days: DayRow[]; event_count: number
  }[];
  sources: Record<string, string>;
};
