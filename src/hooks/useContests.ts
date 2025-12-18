import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Contest } from '@/types/contest';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export function useContests(platform?: string, searchQuery?: string) {
  return useQuery({
    queryKey: ['contests', platform, searchQuery],
    queryFn: async (): Promise<Contest[]> => {
      const params = new URLSearchParams();
      if (platform) params.append('platform', platform);
      if (searchQuery) params.append('search', searchQuery);

      const response = await axios.get(`${API_BASE_URL}/api/contests?${params}`);
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });
}

export function useBookmarks() {
  return useQuery({
    queryKey: ['bookmarks'],
    queryFn: async (): Promise<Contest[]> => {
      const response = await axios.get(`${API_BASE_URL}/api/bookmark`);
      return response.data;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

export function useToggleBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ contest, isBookmarked }: { contest: Contest; isBookmarked: boolean }) => {
      const method = isBookmarked ? 'DELETE' : 'POST';
      const response = await axios({
        method,
        url: `${API_BASE_URL}/api/bookmark`,
        data: contest,
      });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate both contests and bookmarks queries
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      queryClient.invalidateQueries({ queryKey: ['contests'] });
    },
    onError: (error) => {
      console.error('Failed to toggle bookmark:', error);
    },
  });
}

export function useContestReminder() {
  return useMutation({
    mutationFn: async (reminderData: {
      name: string;
      email: string;
      contestName: string;
      startTime: string;
      startTimeISO: string;
      duration: string;
      platformName: string;
      contestLink: string;
    }) => {
      const response = await axios.post(`${API_BASE_URL}/api/reminder`, reminderData);
      return response.data;
    },
    onSuccess: () => {
      console.log('Reminder set successfully');
    },
    onError: (error) => {
      console.error('Failed to set reminder:', error);
    },
  });
}