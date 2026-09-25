interface Address {
  address: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface FormValues {
  title: string;
  description: string;
  serviceName: string;
  skills: string[];

  minAmount: number;
  maxAmount: number;
  currency: string;

  requiredWorkers: number;
  minimumWorkers: number;
  maximumWorkers: number;

  preferredDate?: string;
  preferredStartTime?: string;
  preferredEndTime?: string;
  applicationDeadline?: string;

  workerRequirementType: "CUSTOMER_DEFINED" | "PLATFORM_RECOMMENDED";

  address: Address;
}

export enum JobStatus {
  DRAFT = "DRAFT",
  OPEN = "OPEN",
  SCHEDULED = "SCHEDULED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED",
}