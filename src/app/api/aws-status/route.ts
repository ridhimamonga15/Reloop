import { NextResponse } from 'next/server';
import { checkAWSConnection } from '@/lib/aws/dynamodb';

export async function GET() {
  try {
    const status = await checkAWSConnection();
    return NextResponse.json({
      success: true,
      aws: status,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error checking AWS connection';
    return NextResponse.json({
      success: false,
      aws: {
        configured: false,
        connected: false,
        region: process.env.RELOOP_AWS_REGION || 'ap-south-1',
        tableName: process.env.RELOOP_DYNAMODB_TABLE || 'reloop-records',
        mode: 'demo_local',
        message: `AWS Status check error: ${message}`,
      },
    });
  }
}
