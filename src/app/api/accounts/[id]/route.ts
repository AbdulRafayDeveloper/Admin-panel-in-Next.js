import { query } from "@/app/config/db";
import { NextRequest, NextResponse } from 'next/server';
import { ResultSetHeader } from 'mysql2'; // Use ResultSetHeader instead of OkPacket

// Define a type for the response data
interface ApiResponse {
    status: number;
    message: string;
    data?: any; // Data is optional and can be of any type
}

// Define the DELETE function
export async function DELETE(request: NextRequest): Promise<NextResponse> {
    try {
        // Extract ID from URL
        const segments = request.url.split("accounts/");
        const id = segments[1]; // Ensure correct extraction

        if (!id) {
            return NextResponse.json({
                status: 400,
                message: 'Invalid ID provided.',
            });
        }

        // Perform the delete operation with ResultSetHeader
        const queryResult = await query({
            query: "DELETE FROM user_accounts WHERE id = ?",
            values: [id],
        });

        // Cast the result to ResultSetHeader to access affectedRows
        const resultSetHeader = queryResult as ResultSetHeader;

        // Check if any rows were affected (deleted)
        if (resultSetHeader.affectedRows > 0) {
            return NextResponse.json({
                status: 200,
                message: 'Record Deleted',
                data: queryResult,
            });
        } else {
            return NextResponse.json({
                status: 404,
                message: 'Record Not Deleted',
                data: queryResult,
            });
        }
    } catch (error) {
        console.error('An error occurred while processing the request:', error);
        const response: ApiResponse = { status: 500, message: 'An error occurred while processing the request.' };
        return NextResponse.json(response);
    }
}