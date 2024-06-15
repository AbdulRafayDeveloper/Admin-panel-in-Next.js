import { query } from '@/app/config/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const data = await request.json();
        const values = data.map(({ name, email }) => [name, email]);

        const placeholders = values.map(() => '(?, ?)').join(',');
        const sql = `INSERT INTO repeater (name, email) VALUES ${placeholders}`;

        // Flatten the values array because MySQL driver expects a flat array of values
        const flattenedValues = values.flat();

        // Insert the data into the 'repeater' table
        await query(sql, flattenedValues);

        return NextResponse.json({ status: 200, message: 'Your request has been submitted' });
    } catch (error) {
        console.error("Error occurred:", error);
        return NextResponse.json({ message: "Failed", status: 500 });
    }
}