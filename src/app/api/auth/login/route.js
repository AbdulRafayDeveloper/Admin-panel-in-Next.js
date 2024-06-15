import { query } from "@/app/config/db";
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
const JWT_SECRET = "SecurityInsure";

export async function POST(request) {
    try {
        const { email, password } = await request.json();
        if (!email || !password) {
            return NextResponse.json({ status: 400, message: 'Please fill all fields.' });
        }

        const [user] = await query({
            query: 'SELECT * FROM user_accounts WHERE email = ?',
            values: [email],
        });

        if (!user) {
            return NextResponse.json({ status: 400, message: 'This account does not exist.' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return NextResponse.json({ status: 400, message: 'Password does not match.' });
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role,
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        return NextResponse.json({ status: 200, message: 'Login successfully', data: token, role: user.role });

    } catch (error) {
        console.error("Error occurred:", error);
        return NextResponse.json({ message: "Failed", status: 500 });
    }
}