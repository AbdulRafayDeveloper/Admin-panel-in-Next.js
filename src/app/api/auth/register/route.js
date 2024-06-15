import { query } from "@/app/config/db";
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

export async function POST(request) {
    try {
        const { name, email, password } = await request.json();
        console.log("hit api register backend");

        if (!name || !email || !password) {
            return NextResponse.json({ status: 400, message: 'Fill All the Fields' });
        }

        // Check if the user already exists in the database
        const [checkUserExistence] = await query({
            query: 'SELECT COUNT(*) as count FROM user_accounts WHERE email = ?',
            values: [email],
        });

        if (checkUserExistence.count > 0) {
            return NextResponse.json({ status: 400, message: 'This Account Already Exist' });
        }

        // Hash the password before saving it
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert a new user
        const newUser = await query({
            query: 'INSERT INTO user_accounts (name, email, password) VALUES (?, ?, ?)',
            values: [name, email, hashedPassword],
        });

        if (newUser.affectedRows > 0) {
            return NextResponse.json({ status: 200, message: 'Your Account has been created', data: newUser });
        } else {
            return NextResponse.json({ status: 400, message: 'Your request cannot be submitted. Try Again Later!' });
        }

    } catch (error) {
        console.error("Error occurred:", error); // Log the error
        return NextResponse.json({ message: "Failed", status: 500 });
    }
}