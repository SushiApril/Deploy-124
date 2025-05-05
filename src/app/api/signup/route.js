import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const newUser = await request.json();

    // Basic validation
    if (!newUser.email || !newUser.password || !newUser.name) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Define file paths
    const dataDir = path.join(process.cwd(), 'data');
    const usersFilePath = path.join(dataDir, 'users.json');

    // Ensure the data directory exists
    try {
      await fs.access(dataDir);
    } catch {
      await fs.mkdir(dataDir, { recursive: true });
    }

    // Read or create users.json
    let data;
    try {
      const fileContent = await fs.readFile(usersFilePath, 'utf8');
      data = JSON.parse(fileContent);
    } catch {
      // If file doesn't exist or is invalid, create initial structure
      data = { users: [] };
      await fs.writeFile(usersFilePath, JSON.stringify(data, null, 2));
    }

    // Check if email already exists
    if (data.users.some(user => user.email === newUser.email)) {
      return NextResponse.json(
        { message: 'Email already registered' },
        { status: 400 }
      );
    }

    // Add new user to the array
    data.users.push(newUser);

    // Write back to the file with proper formatting
    await fs.writeFile(usersFilePath, JSON.stringify(data, null, 2), 'utf8');

    return NextResponse.json(
      { message: 'User registered successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { message: 'Failed to create account: ' + error.message },
      { status: 500 }
    );
  }
} 