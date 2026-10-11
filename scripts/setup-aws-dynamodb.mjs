/**
 * ReLoop AWS DynamoDB Provisioning Script
 * Team GreenStack • Environmental Hacks
 *
 * Usage:
 *   node scripts/setup-aws-dynamodb.mjs
 *
 * Reads AWS credentials from environment variables:
 *   AWS_REGION or RELOOP_AWS_REGION (default: ap-south-1)
 *   AWS_ACCESS_KEY_ID or RELOOP_AWS_ACCESS_KEY_ID
 *   AWS_SECRET_ACCESS_KEY or RELOOP_AWS_SECRET_ACCESS_KEY
 *   DYNAMODB_TABLE_NAME or RELOOP_DYNAMODB_TABLE (default: reloop-records)
 */

import { DynamoDBClient, CreateTableCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb';

const region = process.env.RELOOP_AWS_REGION || process.env.AWS_REGION || 'ap-south-1';
const accessKeyId = process.env.RELOOP_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.RELOOP_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;
const tableName = process.env.RELOOP_DYNAMODB_TABLE || process.env.DYNAMODB_TABLE_NAME || 'reloop-records';

console.log('='.repeat(60));
console.log('  ReLoop - Amazon DynamoDB Automated Setup');
console.log('  Team: GreenStack | Project: Circular Resource Intelligence');
console.log('='.repeat(60));

if (!accessKeyId || !secretAccessKey) {
  console.log('\n❌ AWS Credentials Not Found in Environment Variables.');
  console.log('\nTo configure real AWS cloud persistence, set:');
  console.log('  export AWS_REGION="ap-south-1"');
  console.log('  export AWS_ACCESS_KEY_ID="your-access-key-id"');
  console.log('  export AWS_SECRET_ACCESS_KEY="your-secret-access-key"');
  console.log('\nOn Windows PowerShell:');
  console.log('  $env:AWS_REGION="ap-south-1"');
  console.log('  $env:AWS_ACCESS_KEY_ID="your-access-key-id"');
  console.log('  $env:AWS_SECRET_ACCESS_KEY="your-secret-access-key"');
  console.log('\nℹ️  Note: ReLoop runs automatically in Local Demo Mode if AWS is not configured.');
  process.exit(0);
}

const client = new DynamoDBClient({
  region,
  credentials: { accessKeyId, secretAccessKey },
});

async function run() {
  console.log(`\n🔍 Checking table "${tableName}" in region "${region}"...`);

  try {
    const describeRes = await client.send(new DescribeTableCommand({ TableName: tableName }));
    console.log(`✅ Table "${tableName}" already exists!`);
    console.log(`   Status: ${describeRes.Table.TableStatus}`);
    console.log(`   Item Count: ${describeRes.Table.ItemCount}`);
    console.log(`   ARN: ${describeRes.Table.TableArn}`);
    console.log('\n✨ ReLoop is ready to connect to your live DynamoDB table!');
    return;
  } catch (err) {
    if (err.name !== 'ResourceNotFoundException') {
      console.error('❌ Error inspecting table:', err.message);
      process.exit(1);
    }
  }

  console.log(`🚀 Creating table "${tableName}" with Single-Table schema...`);

  const createParams = {
    TableName: tableName,
    BillingMode: 'PAY_PER_REQUEST',
    AttributeDefinitions: [
      { AttributeName: 'PK', AttributeType: 'S' },
      { AttributeName: 'SK', AttributeType: 'S' },
      { AttributeName: 'GSI1PK', AttributeType: 'S' },
      { AttributeName: 'GSI1SK', AttributeType: 'S' },
    ],
    KeySchema: [
      { AttributeName: 'PK', KeyType: 'HASH' },
      { AttributeName: 'SK', KeyType: 'RANGE' },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'GSI1',
        KeySchema: [
          { AttributeName: 'GSI1PK', KeyType: 'HASH' },
          { AttributeName: 'GSI1SK', KeyType: 'RANGE' },
        ],
        Projection: { ProjectionType: 'ALL' },
      },
    ],
    Tags: [
      { Key: 'Project', Value: 'ReLoop' },
      { Key: 'Team', Value: 'GreenStack' },
    ],
  };

  try {
    const createRes = await client.send(new CreateTableCommand(createParams));
    console.log(`✅ Table creation initiated! Status: ${createRes.TableDescription.TableStatus}`);
    console.log(`   ARN: ${createRes.TableDescription.TableArn}`);
    console.log('\n🎉 Amazon DynamoDB table provisioned successfully for ReLoop!');
  } catch (err) {
    console.error('❌ Table creation failed:', err.message);
    process.exit(1);
  }
}

run();
