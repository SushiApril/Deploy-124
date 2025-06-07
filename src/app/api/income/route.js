// src/app/api/income/route.js
import { MongoClient } from 'mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const uri = process.env.ATLAS_URI;

export async function POST(req) {
  // 1) Verify session & get user email
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 });
  }

  // 2) Parse incoming income data
  const data = await req.json();
  data.userEmail = session.user.email; // stamp with email
  data.type = 'income';                // mark as income

  // 3) Insert into MongoDB
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('BudgetingApp');
    const coll = db.collection('Transactions');
    const result = await coll.insertOne(data);

    return new Response(
      JSON.stringify({ insertedId: result.insertedId }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    console.error('Income API Error:', e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  } finally {
    await client.close();
  }
}
