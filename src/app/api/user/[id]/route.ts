import { query } from "@/app/config/db";
import { NextRequest, NextResponse } from 'next/server';
import { ResultSetHeader } from 'mysql2'; // Use ResultSetHeader instead of OkPacket
import { promises as fs } from "fs";
import path from "path";

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
        const segments = request.url.split("user/");
        const id = segments[1]; // Ensure correct extraction

        if (!id) {
            return NextResponse.json({
                status: 400,
                message: 'Invalid ID provided.',
            });
        }

        console.log("ID to delete:", id);

        // Fetch the filename associated with the user
        const getUserFileQueryResult = await query({
            query: "SELECT file FROM user WHERE id = ?",
            values: [id],
        });

        if (!Array.isArray(getUserFileQueryResult) || getUserFileQueryResult.length === 0) {
            return NextResponse.json({
                status: 404,
                message: 'Record not found.',
            });
        }

        const userFile = getUserFileQueryResult[0].file;


        // Perform the delete operation with ResultSetHeader
        const queryResult = await query({
            query: "DELETE FROM user WHERE id = ?",
            values: [id],
        });

        // Cast the result to ResultSetHeader to access affectedRows
        const resultSetHeader = queryResult as ResultSetHeader;

        // Check if any rows were affected (deleted)
        if (resultSetHeader.affectedRows > 0) {
            if (userFile) {
                const filePath = path.join(process.cwd(), "public/assets/", userFile);
                await fs.unlink(filePath);
            }
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