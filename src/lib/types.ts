import type { Timestamp } from 'firebase/firestore';

export interface Call {
  id: string;
  patientName: string;
  roomNumber: string;
  professionalName: string;
  timestamp: Timestamp;
}
