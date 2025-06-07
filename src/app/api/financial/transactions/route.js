// src/app/api/financial/transactions/route.js
import { MongoClient } from 'mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const uri = process.env.ATLAS_URI;

export async function GET(req) {
  // 1) Auth check
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return new Response(
      JSON.stringify({ error: 'Not authenticated' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 2) Fetch all this user’s transactions
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const docs = await client
      .db('BudgetingApp')
      .collection('Transactions')
      .find({ userEmail: session.user.email })
      .toArray();

    return new Response(
      JSON.stringify({ transactions: docs }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    console.error('Transactions API Error:', e);
    return new Response(
      JSON.stringify({ error: e.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  } finally {
    await client.close();
  }
}
