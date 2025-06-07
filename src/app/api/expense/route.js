// src/app/api/expense/route.js
import { MongoClient } from 'mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const uri = process.env.ATLAS_URI;

export async function GET(req) {
  // 1️⃣ Check auth
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return new Response(
      JSON.stringify({ error: 'Not authenticated' }),
      { status: 401 }
    );
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('BudgetingApp');
    const coll = db.collection('Transactions');

    // 2️⃣ Fetch only this user’s expenses
    const docs = await coll
      .find({ userEmail: session.user.email, type: 'expense' })
      .sort({ date: -1 })            // most recent first, optional
      .toArray();

    // 3️⃣ Return as { expenses: [...] }
    return new Response(
      JSON.stringify({ expenses: docs }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (e) {
    console.error('GET /api/expense error:', e);
    return new Response(
      JSON.stringify({ error: e.message }),
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return new Response(
      JSON.stringify({ error: 'Not authenticated' }),
      { status: 401 }
    );
  }

  const data = await req.json();
  data.type = 'expense';
  data.userEmail = session.user.email;

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('BudgetingApp');
    const coll = db.collection('Transactions');
    const result = await coll.insertOne(data);
    return new Response(
      JSON.stringify({ ...data, _id: result.insertedId }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (e) {
    console.error('POST /api/expense error:', e);
    return new Response(
      JSON.stringify({ error: e.message }),
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
