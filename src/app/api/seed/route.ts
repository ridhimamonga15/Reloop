import { NextResponse } from 'next/server';
import { dataStore } from '@/lib/storage/store';

export async function POST() {
  try {
    const result = dataStore.resetDemoData();
    return NextResponse.json({
      success: true,
      message: 'Demo workspace reset successfully to baseline scenario.',
      count: result.count,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error resetting demo data';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
