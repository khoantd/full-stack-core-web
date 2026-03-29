import axiosClient from "@/api/axiosClient";
import {
  EventsResponse,
  Event,
  Attendee,
  EventsQueryParams,
  CreateEventRequest,
  UpdateEventRequest,
} from "@/types/event.type";

export const eventApi = {
  getEvents: async (params: EventsQueryParams = {}): Promise<EventsResponse> => {
    const { page = 1, limit = 10, search, isPublished } = params;
    const queryParams = new URLSearchParams();
    queryParams.append("page", String(page));
    queryParams.append("limit", String(limit));
    if (search) queryParams.append("search", search);
    if (isPublished !== undefined) queryParams.append("isPublished", String(isPublished));
    const response = await axiosClient.get(`/events?${queryParams.toString()}`);
    return response.data;
  },

  getEventById: async (id: string): Promise<Event> => {
    const response = await axiosClient.get(`/events/${id}`);
    return response.data;
  },

  createEvent: async (data: CreateEventRequest): Promise<Event> => {
    const response = await axiosClient.post("/events", data);
    return response.data;
  },

  updateEvent: async (id: string, data: UpdateEventRequest): Promise<Event> => {
    const response = await axiosClient.put(`/events/${id}`, data);
    return response.data;
  },

  deleteEvent: async (id: string): Promise<void> => {
    await axiosClient.delete(`/events/${id}`);
  },

  // Attendee management
  getAttendees: async (eventId: string): Promise<Attendee[]> => {
    const response = await axiosClient.get(`/events/${eventId}/attendees`);
    return response.data;
  },

  registerAttendee: async (eventId: string, data: { name: string; email: string }): Promise<Attendee> => {
    const response = await axiosClient.post(`/events/${eventId}/attendees`, data);
    return response.data;
  },

  updateAttendeeStatus: async (eventId: string, attendeeId: string, status: string): Promise<Attendee> => {
    const response = await axiosClient.put(`/events/${eventId}/attendees/${attendeeId}/status`, { status });
    return response.data;
  },

  exportAttendees: (eventId: string): string => {
    return `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/events/${eventId}/attendees/export`;
  },
};
