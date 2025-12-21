export interface HackathonTheme {
    id: number;
    name: string;
}

export interface Hackathon {
    _id?: string;
    id: number;
    url: string;
    title: string;
    thumbnail_url: string;
    featured: boolean;
    organization_name: string;
    isOpen: 'open' | 'closed';
    submission_period_dates: string;
    displayed_location: string;
    registrations_count: number;
    prizeText: string;
    time_left_to_submission: string;
    themes: HackathonTheme[];
    start_a_submission_url: string;
    source: string;
    type: 'online' | 'offline'; // Added for filtering
    startDate?: string | null;
    endDate?: string | null;
    last_updated?: string;
}

export interface HackathonResponse {
    last_updated: string;
    count: number;
    hackathons: Hackathon[];
}
