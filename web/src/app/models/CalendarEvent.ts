import { User } from "./User";

export interface CalendarEvent {
  id: string;
  title: string;
  startUtc: string;
  endUtc: string;
  roomId: string;
  attendees: User[]; // Explicitly typed as an array of User
}
