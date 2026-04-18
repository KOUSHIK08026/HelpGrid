export type UrgencyLevel = 'Low' | 'Medium' | 'High';

export interface Need {
  id: string;
  title: string;
  description: string;
  location: string;
  dateRequired: string;
  urgency: UrgencyLevel;
  requiredSkills: string[];
  ngoId: string;
  status: 'Open' | 'Filled' | 'Closed';
  volunteerCount: number;
  maxVolunteers: number;
  createdAt: string;
}

export interface Volunteer {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  skills: string[];
  availability: string[]; // e.g., ["Weekend", "Evening"]
  bio: string;
  matchedTasks: string[]; // IDs of needs
  status: 'Available' | 'Busy';
}

export interface Match {
  id: string;
  volunteerId: string;
  volunteerName: string;
  ngoId: string;
  needId: string;
  needTitle: string;
  urgency: UrgencyLevel;
  matchDate: string;
  confidenceScore: number; // For AI matching
}
