
export type EventCategory = 'Salud' | 'Colegio' | 'Ocio' | 'Trabajo' | 'Hogar' | 'Otro';

export interface FamilyMember {
  id: string;
  name: string;
  color: string;
  avatar: string;
}

export interface AgendaEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // ISO format
  startTime?: string;
  endTime?: string;
  memberId: string;
  category: EventCategory;
  isReminder: boolean;
}

export interface ImportState {
  isImporting: boolean;
  error?: string;
}
