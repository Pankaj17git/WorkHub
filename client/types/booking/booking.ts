export type BookingTimelineStatus =
  | 'CONFIRMED'
  | 'PRO_ASSIGNED'
  | 'ON_THE_WAY'
  | 'ARRIVED'
  | 'IN_PROGRESS'
  | 'COMPLETED';

export interface BookingProgressStep {
  id: string;
  title: string;
  subtitle: string;
  timestamp: string;
  state: 'COMPLETED' | 'ACTIVE' | 'UPCOMING';
}
