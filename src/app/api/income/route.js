import { MongoClient } from 'mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const uri = process.env.ATLAS_URI;

export async function GET() {
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
    const docs = await coll
      .find({ userEmail: session.user.email, type: 'income' })
      .sort({ date: -1 })
      .toArray();

    return new Response(
      JSON.stringify({ incomes: docs }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (e) {
    console.error('GET /api/income error:', e);
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
  data.userEmail = session.user.email;
  data.type = 'income';

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('BudgetingApp');
    const coll = db.collection('Transactions');
    const result = await coll.insertOne(data);

    // Return the full saved object so SWR can append it
    return new Response(
      JSON.stringify({ ...data, _id: result.insertedId }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (e) {
    console.error('POST /api/income error:', e);
    return new Response(
      JSON.stringify({ error: e.message }),
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
