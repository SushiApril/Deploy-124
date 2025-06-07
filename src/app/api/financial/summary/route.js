// src/app/api/financial/summary/route.js
import { MongoClient } from 'mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import {
  summarizeByDay,
  summarizeByWeek,
  summarizeByMonth,
} from '@/lib/financialLogic';

const uri = process.env.ATLAS_URI;

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return new Response(
      JSON.stringify({ error: 'Not authenticated' }),
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const freq = searchParams.get('freq') || 'monthly';

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('BudgetingApp');
    const coll = db.collection('Transactions');

    const docs = await coll
      .find({ userEmail: session.user.email })
      .project({ date: 1, type: 1, amount: 1, _id: 0 })
      .toArray();

    let summary;
    if (freq === 'daily') summary = summarizeByDay(docs);
    else if (freq === 'weekly') summary = summarizeByWeek(docs);
    else summary = summarizeByMonth(docs);

    return new Response(
      JSON.stringify({ summary }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('API Error:', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
