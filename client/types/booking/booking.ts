export type BookingTimelineStatus =
  | 'ASSIGNED'
  | 'CONFIRMED'
  | 'PRO_ASSIGNED'
  | 'ON_THE_WAY'
  | 'ARRIVED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export interface BookingProgressStep {
  id: string;
  title: string;
  subtitle: string;
  timestamp: string;
  state: 'COMPLETED' | 'ACTIVE' | 'UPCOMING';
}
