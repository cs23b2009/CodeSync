import { NextResponse } from 'next/server';
import { importUsersFromCSV } from '@/services/search/csvImporter';

export async function POST() {
    try {
        // Trigger the import process in the background
        importUsersFromCSV();
        return NextResponse.json({ message: 'Import process started in background' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to start import' }, { status: 500 });
    }
}
