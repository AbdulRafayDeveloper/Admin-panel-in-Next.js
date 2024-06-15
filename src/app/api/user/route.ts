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

// Define a type for the expected request payload
interface UserRequest {
    name: string;
    email: string;
    service: string;
    subject: string;
    message: string;
}

// Define a type for the response data
interface ApiResponse {
    status: number;
    message: string;
    data?: any; // Data is optional and can be of any type
}

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;
        const name = formData.get("name");
        const email = formData.get("email");
        const service = formData.get("service");
        const subject = formData.get("subject");
        const message = formData.get("message");

        if (name && email && service && subject && file) {
            // Check if the user already exists in the database
            const checkUserExistence = await query({
                query: "SELECT COUNT(*) as count FROM user WHERE email = ?",
                values: [email],
            });

            if (Array.isArray(checkUserExistence) && checkUserExistence[0].count > 0) {
                return NextResponse.json({ status: 400, message: "Your request has already been submitted to Admin" });
            }

            // Insert a new user
            const insertUser = await query({
                query: "INSERT INTO user (name, email, service, subject, message) VALUES (?, ?, ?, ?, ?)",
                values: [name, email, service, subject, message],
            });

            if (insertUser.affectedRows > 0) {
                // Get the inserted user ID
                const userId = insertUser.insertId; // Use insertId to get the new user ID

                console.log("file: ",file);
                // const fileOrginalName = file.split('\\').pop().split('/').pop(); // This will remove any fake path
                const fileOrginalName = file.name;
                // Ensure the correct filename
                const baseFilename = fileOrginalName.substring(0, fileOrginalName.lastIndexOf(".")).replaceAll(" ", "_");
                console.log("baseFilename: ",baseFilename);
                const fileExtension = fileOrginalName.substring(fileOrginalName.lastIndexOf("."));
                console.log("fileExtension: ",fileExtension);
                const filename = `${baseFilename}_${userId}${fileExtension}`;
                console.log("filename: ",filename);
                // Insert a new user
                const userFile = await query({
                    query: "UPDATE user SET file = ? WHERE id = ?",
                    values: [filename, userId],
                });
                // Ensure newUser has the expected structure
                if ('affectedRows' in userFile && userFile.affectedRows > 0) {
                    // // Write the file to the public/assets directory
                    // const buffer = Buffer.from(await file.arrayBuffer());
                    // await fs.writeFile(path.join(process.cwd(), "public/assets/", filename), buffer);
                    // const response: ApiResponse = { status: 200, message: 'Your request has been submitted', data: userFile };
                    // return NextResponse.json(response);

                    // Write the file to the public/assets directory
                    const buffer = Buffer.from(await file.arrayBuffer());
                    await fs.writeFile(path.join(process.cwd(), "public/assets/", filename), buffer);
                    const response = { status: 200, message: 'Your request has been submitted', data: userFile };
                    return NextResponse.json(response);
                } else {
                    const response: ApiResponse = { status: 400, message: 'Your request cannot submit. Try Again Later!', data: newService };
                    return NextResponse.json(response);
                }
            } else {
                return NextResponse.json({ status: 400, message: "Your request could not be submitted. Try again later!" });
            }
        } else {
            return NextResponse.json({ status: 400, message: "Please fill in all the fields." });
        }
    } catch (error) {
        console.error("Error occurred:", error);
        return NextResponse.json({ message: "Failed", status: 500 });
    }
}

// GET function to retrieve all users
export async function GET(request: NextRequest): Promise<NextResponse> {
    try {
        console.log("Enter in GET API");

        // Perform the database query
        const queryResult: QueryResult = await query({
            query: 'SELECT * FROM user',
            values: [],
        });

        // Ensure the result is an array of users
        if (Array.isArray(queryResult)) {
            const users: User[] = queryResult.filter(item => 'id' in item); // Narrowing to User[]
            if (users.length > 0) {
                return NextResponse.json({
                    status: 200,
                    message: 'Records found',
                    data: users,
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