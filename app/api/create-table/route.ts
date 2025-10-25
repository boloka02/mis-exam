import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS examini_details (
        id SERIAL PRIMARY KEY,
        examination_id VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    return NextResponse.json({ message: 'Table created successfully' });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}