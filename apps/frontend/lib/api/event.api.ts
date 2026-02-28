import axiosClient from "@/api/axiosClient";
import {
  EventsResponse,
  Event,
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

    if (search) {
      queryParams.append("search", search);
    }

    if (isPublished !== undefined) {
      queryParams.append("isPublished", String(isPublished));
    }

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
};
