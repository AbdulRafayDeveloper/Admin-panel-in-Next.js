import { query } from "@/app/config/db";
import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// Define types for database query results
interface OkPacket {
    affectedRows: number;
}

interface User {
    id: number;
    name: string;
    email: string;
}

// Define a type for the response data
interface ApiResponse {
    status: number;
    message: string;
    data?: any; // Data is optional and can be of any type
}

// GET function to retrieve all users
export async function GET(request: NextRequest): Promise<NextResponse> {
    try {
        console.log("Enter in GET API");

        // Perform the database query
        const queryResult = await query({
            query: 'SELECT * FROM user_accounts',
            values: [],
        });

        // Ensure the result is an array of users
        if (Array.isArray(queryResult)) {
            const users: User[] = queryResult.filter(item => 'id' in item); // Narrowing to User[]
            if (users.length > 0) {
                const response: ApiResponse = { status: 200, message: 'Records found', data: users };
                return NextResponse.json(response);
            } else {
                const response: ApiResponse = { status: 200, message: 'No Records found', data: users };
                return NextResponse.json(response);
            }
        } else {
            const response: ApiResponse = { status: 200, message: 'Unexpected query result structure' };
            return NextResponse.json(response);
        }
    } catch (error: any) {
        console.error('An error occurred while retrieving the records:', error);
        const response: ApiResponse = { status: 500, message: 'An error occurred while retrieving the records' };
        return NextResponse.json(response);
    }
}