import { query } from "@/app/config/db";
import { NextRequest, NextResponse } from 'next/server';

type QueryResult = Service[] | OkPacket | any | any[];

// Define types for database query results
interface OkPacket {
    affectedRows: number;
}

// Define a type for the expected request payload
interface ServiceRequest {
    name: string;
    description: string;
}

interface Service {
    id: number;
    name: string;
}

// Define a type for the response data
interface ApiResponse {
    status: number;
    message: string;
    data?: any; // Data is optional and can be of any type
}

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const { name, description }: ServiceRequest = await request.json();

        if (name && description) {
            // Check if the user already exists in the database
            const checkServiceExistence = await query({
                query: 'SELECT COUNT(*) as count FROM services WHERE name = ?',
                values: [name],
            });

            // Type-check and ensure the expected structure
            if (Array.isArray(checkServiceExistence) && 'count' in checkServiceExistence[0]) {
                if (checkServiceExistence[0].count > 0) { // Optional chaining to prevent undefined errors
                    const response: ApiResponse = { status: 400, message: 'This Service Already Exist' };
                    return NextResponse.json(response);
                } else {
                    // Insert a new user
                    const newService = await query({
                        query: 'INSERT INTO services (name, description) VALUES (?, ?)',
                        values: [name, description],
                    });
                    // Ensure newUser has the expected structure
                    if ('affectedRows' in newService && newService.affectedRows > 0) {
                        const response: ApiResponse = { status: 200, message: 'Your request has been submitted', data: newService };
                        return NextResponse.json(response);
                    } else {
                        const response: ApiResponse = { status: 400, message: 'Your request cannot submit. Try Again Later!', data: newService };
                        return NextResponse.json(response);
                    }
                }
            } else {
                const response: ApiResponse = { status: 400, message: 'Your request cannot submit to Admin. Try Again Later!' };
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

// GET function to retrieve all users
export async function GET(request: NextRequest): Promise<NextResponse> {
    try {
        // Perform the database query
        const queryResult: QueryResult = await query({
            query: 'SELECT * FROM services',
            values: [],
        });

        // Ensure the result is an array of users
        if (Array.isArray(queryResult)) {
            const services: Service[] = queryResult.filter(item => 'id' in item);
            if (services.length > 0) {
                return NextResponse.json({
                    status: 200,
                    message: 'Records found',
                    data: services,
                });
            } else {
                return NextResponse.json({
                    status: 200,
                    message: 'No records found',
                });
            }
        } else {
            return NextResponse.json({
                status: 400,
                message: 'Unexpected query result structure.',
            });
        }
    } catch (error: any) {
        console.error('An error occurred while retrieving the records:', error);
        return NextResponse.json({
            status: 500,
            message: 'An error occurred while retrieving the records.',
        });
    }
}