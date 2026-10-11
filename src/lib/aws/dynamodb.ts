import { DynamoDBClient, DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  ScanCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
import { Listing, AWSStatus } from '@/types';

const region =
  process.env.RELOOP_AWS_REGION || process.env.AWS_REGION || 'ap-south-1';
const accessKeyId =
  process.env.RELOOP_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey =
  process.env.RELOOP_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;
const tableName =
  process.env.RELOOP_DYNAMODB_TABLE || process.env.DYNAMODB_TABLE_NAME || 'reloop-records';

export const isAWSConfigured = Boolean(
  accessKeyId && secretAccessKey && accessKeyId.trim() !== '' && secretAccessKey.trim() !== ''
);

let docClient: DynamoDBDocumentClient | null = null;

export function getDynamoDBClient(): DynamoDBDocumentClient | null {
  if (!isAWSConfigured) return null;
  if (docClient) return docClient;

  try {
    const client = new DynamoDBClient({
      region,
      credentials: {
        accessKeyId: accessKeyId!,
        secretAccessKey: secretAccessKey!,
      },
    });

    docClient = DynamoDBDocumentClient.from(client, {
      marshallOptions: {
        removeUndefinedValues: true,
      },
    });

    return docClient;
  } catch (error) {
    console.error('Failed to initialize AWS DynamoDB Client:', error);
    return null;
  }
}

/**
 * Check whether AWS DynamoDB is actually connected and reachable.
 */
export async function checkAWSConnection(): Promise<AWSStatus> {
  if (!isAWSConfigured) {
    return {
      configured: false,
      connected: false,
      region,
      tableName,
      mode: 'demo_local',
      message:
        'AWS credentials not set in environment. Running in Demo Workspace mode with localized persistence.',
    };
  }

  const client = getDynamoDBClient();
  if (!client) {
    return {
      configured: true,
      connected: false,
      region,
      tableName,
      mode: 'demo_local',
      message: 'AWS SDK client failed to initialize with provided credentials.',
    };
  }

  const startTime = Date.now();
  try {
    const rawClient = new DynamoDBClient({
      region,
      credentials: {
        accessKeyId: accessKeyId!,
        secretAccessKey: secretAccessKey!,
      },
    });

    const command = new DescribeTableCommand({ TableName: tableName });
    const response = await rawClient.send(command);
    const latencyMs = Date.now() - startTime;

    return {
      configured: true,
      connected: true,
      region,
      tableName,
      mode: 'aws_dynamodb',
      latencyMs,
      message: `Successfully connected to Amazon DynamoDB table "${tableName}" (${response.Table?.TableStatus ?? 'ACTIVE'}) in ${region} in ${latencyMs}ms.`,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      configured: true,
      connected: false,
      region,
      tableName,
      mode: 'demo_local',
      message: `AWS configuration present, but DynamoDB check failed: ${errorMsg}. Falling back to demo store.`,
    };
  }
}

/**
 * Persist listing to DynamoDB if AWS is configured
 */
export async function saveListingToDynamoDB(listing: Listing): Promise<boolean> {
  const client = getDynamoDBClient();
  if (!client) return false;

  try {
    const item = {
      PK: `LISTING#${listing.id}`,
      SK: 'METADATA',
      GSI1PK: `CATEGORY#${listing.category}`,
      GSI1SK: `STATUS#${listing.status}`,
      ...listing,
      source: 'aws_dynamodb',
    };

    await client.send(
      new PutCommand({
        TableName: tableName,
        Item: item,
      })
    );
    return true;
  } catch (error) {
    console.error('DynamoDB saveListing error:', error);
    return false;
  }
}

/**
 * Fetch all listings from DynamoDB
 */
export async function getListingsFromDynamoDB(): Promise<Listing[] | null> {
  const client = getDynamoDBClient();
  if (!client) return null;

  try {
    const result = await client.send(
      new ScanCommand({
        TableName: tableName,
      })
    );

    if (!result.Items) return [];
    return result.Items.map((item) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { PK, SK, GSI1PK, GSI1SK, ...listing } = item;
      return listing as Listing;
    });
  } catch (error) {
    console.error('DynamoDB scan error:', error);
    return null;
  }
}

/**
 * Fetch a single listing by ID from DynamoDB
 */
export async function getListingByIdFromDynamoDB(id: string): Promise<Listing | null> {
  const client = getDynamoDBClient();
  if (!client) return null;

  try {
    const result = await client.send(
      new GetCommand({
        TableName: tableName,
        Key: {
          PK: `LISTING#${id}`,
          SK: 'METADATA',
        },
      })
    );

    if (!result.Item) return null;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { PK, SK, GSI1PK, GSI1SK, ...listing } = result.Item;
    return listing as Listing;
  } catch (error) {
    console.error('DynamoDB getItem error:', error);
    return null;
  }
}

/**
 * Delete listing from DynamoDB
 */
export async function deleteListingFromDynamoDB(id: string): Promise<boolean> {
  const client = getDynamoDBClient();
  if (!client) return false;

  try {
    await client.send(
      new DeleteCommand({
        TableName: tableName,
        Key: {
          PK: `LISTING#${id}`,
          SK: 'METADATA',
        },
      })
    );
    return true;
  } catch (error) {
    console.error('DynamoDB deleteItem error:', error);
    return false;
  }
}
