import { MongoClient } from "mongodb";

const uri = process.env.ATLAS_URI;
console.log("ATLAS_URI loaded in API route:", uri); // Debug: Check if URI is loaded

export async function POST(request) {
  let data;
  try {
    data = await request.json();
    console.log("Received data in API route:", data); // Debug: Check received data
  } catch (err) {
    console.error("Error parsing request body:", err);
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  if (!uri) {
    console.error("ATLAS_URI is undefined!");
    return new Response(JSON.stringify({ error: "Database connection string not set" }), { status: 500 });
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("BudgetingApp");
    const collection = db.collection("Expenses");
    const result = await collection.insertOne(data);
    console.log("Insert result:", result); // Debug: Check insert result
    return new Response(JSON.stringify({ insertedId: result.insertedId }), { status: 201 });
  } catch (e) {
    console.error("API Error:", e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  } finally {
    await client.close();
  }
}