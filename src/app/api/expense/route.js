// src/app/api/expense/route.js
import { MongoClient } from 'mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { ObjectId } from 'mongodb';

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

    // 2️⃣ Fetch only this user's expenses
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

export async function PUT(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return new Response(
      JSON.stringify({ error: 'Not authenticated' }),
      { status: 401 }
    );
  }

  const data = await req.json();
  const { _id, ...updateData } = data;

  if (!_id) {
    return new Response(
      JSON.stringify({ error: 'Expense ID is required' }),
      { status: 400 }
    );
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('BudgetingApp');
    const coll = db.collection('Transactions');

    // Ensure the expense belongs to the user
    const existingExpense = await coll.findOne({
      _id: new ObjectId(_id),
      userEmail: session.user.email,
      type: 'expense'
    });

    if (!existingExpense) {
      return new Response(
        JSON.stringify({ error: 'Expense not found or unauthorized' }),
        { status: 404 }
      );
    }

    // Update the expense
    const result = await coll.updateOne(
      { _id: new ObjectId(_id) },
      { $set: { ...updateData, type: 'expense', userEmail: session.user.email } }
    );

    if (result.matchedCount === 0) {
      return new Response(
        JSON.stringify({ error: 'Failed to update expense' }),
        { status: 404 }
      );
    }

    // Return the updated expense
    const updatedExpense = await coll.findOne({ _id: new ObjectId(_id) });
    return new Response(
      JSON.stringify(updatedExpense),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (e) {
    console.error('PUT /api/expense error:', e);
    return new Response(
      JSON.stringify({ error: e.message }),
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

export async function DELETE(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return new Response(
      JSON.stringify({ error: 'Not authenticated' }),
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response(
      JSON.stringify({ error: 'Expense ID is required' }),
      { status: 400 }
    );
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('BudgetingApp');
    const coll = db.collection('Transactions');

    // Ensure user can only delete their own expenses
    const result = await coll.deleteOne({
      _id: new ObjectId(id),
      userEmail: session.user.email,
      type: 'expense'
    });

    if (result.deletedCount === 0) {
      return new Response(
        JSON.stringify({ error: 'Expense not found or unauthorized' }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (e) {
    console.error('DELETE /api/expense error:', e);
    return new Response(
      JSON.stringify({ error: e.message }),
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
