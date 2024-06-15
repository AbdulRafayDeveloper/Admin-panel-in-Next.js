import { query } from "@/app/config/db";
import { NextRequest, NextResponse } from 'next/server';
import { ResultSetHeader } from 'mysql2';

// Define a type for the response data
interface ApiResponse {
    status: number;
    message: string;
    data?: any; // Data is optional and can be of any type
}

// Define a type for the expected request payload
interface ServiceRequest {
    name: string;
    description: string;
}

// Define the DELETE function
export async function DELETE(request: NextRequest): Promise<NextResponse> {
    try {
        // Extract ID from URL
        const segments = request.url.split("services/");
        const id = segments[1]; // Ensure correct extraction

        if (!id) {
            return NextResponse.json({
                status: 400,
                message: 'Invalid ID provided.',
            });
        }

        console.log("ID to delete:", id);

        // Perform the delete operation with ResultSetHeader
        const queryResult = await query({
            query: "DELETE FROM services WHERE id = ?",
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

// Define the GET function
export async function GET(request: NextRequest): Promise<NextResponse> {
    try {
        const segments = request.url.split("services/");
        const id = segments[1];

        if (!id) {
            const response: ApiResponse = {
                status: 400,
                message: 'Invalid ID provided.'
            };
            return NextResponse.json(response);
        }

        // Perform query to retrieve the service by ID
        const queryResult = await query({
            query: 'SELECT * FROM services WHERE id = ?',
            values: [id],
        });

        if (queryResult) {
            const response: ApiResponse = {
                status: 200,
                message: 'Record found',
                data: queryResult,
            };
            return NextResponse.json(response);
        } else {
            const response: ApiResponse = {
                status: 404,
                message: 'No record found for the provided ID.',
            };
            return NextResponse.json(response);
        }
    } catch (error) {
        console.error('An error occurred while retrieving the record:', error);
        const response: ApiResponse = {
            status: 500,
            message: 'An error occurred while retrieving the record.'
        };
        return NextResponse.json(response);
    }
}


export async function PUT(request: NextRequest): Promise<NextResponse> {
    try {

        const segments = request.url.split("services/");
        const id = segments[1];
        console.log("id: ", id);

        const { description }: ServiceRequest = await request.json();

        console.log("1")

        if (description) {
            const newService = await query({
                query: "UPDATE services SET description = ? WHERE id = ?",
                values: [description, id],
            });
            // Ensure newUser has the expected structure
            if ('affectedRows' in newService && newService.affectedRows > 0) {
                const response: ApiResponse = { status: 200, message: 'Your request has been submitted', data: newService };
                return NextResponse.json(response);
            } else {
                const response: ApiResponse = { status: 400, message: 'Your request cannot submit. Try Again Later!', data: newService };
                return NextResponse.json(response);
            }
        } else {
            // If required fields are missing
            const response: ApiResponse = { status: 400, message: 'Fill All the Fields' };
            return NextResponse.json(response);
        }
    } catch (error) {
        console.error("Error occurred:", error); // Log the error
        return NextResponse.json({ message: "Failed", status: 500 });
    }
}
