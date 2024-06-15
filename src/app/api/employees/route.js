import { query } from "@/app/config/db";
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function POST(request) {
    try {
        const formData = await request.formData();

        const name = formData.get("name");
        const email = formData.get("email");
        const salary = formData.get("salary");
        const jobType = formData.get("jobType");
        const gender = formData.get("gender");
        const pic = formData.get("pic");
        const cv = formData.get("cv");

        if (!(name && email && salary && jobType && gender && pic && cv)) {
            return NextResponse.json({ status: 400, message: "Please fill in all the fields." });
        }

        // Check if the user already exists in the database
        const [checkUserExistence] = await query({ query: "SELECT COUNT(*) as count FROM employees WHERE email = ?", values: [email], });

        if (checkUserExistence.count > 0) {
            return NextResponse.json({ status: 400, message: "Your request has already been submitted to Admin" });
        }

        // Insert a new employee
        const insertEmployee = await query({
            query: "INSERT INTO employees (name, email, salary, jobType, gender) VALUES (?, ?, ?, ?, ?)",
            values: [name, email, salary, jobType, gender],
        });

        if (insertEmployee.affectedRows <= 0) {
            return NextResponse.json({ status: 400, message: "Your request could not be submitted. Try again later!" });
        }

        // Get the inserted user ID
        const userId = insertEmployee.insertId; // Use insertId to get the new user ID

        // Pic //
        const picOrginalName = pic.name;
        const basePicName = picOrginalName.substring(0, picOrginalName.lastIndexOf(".")).replaceAll(" ", "_");
        const picExtension = picOrginalName.substring(picOrginalName.lastIndexOf("."));
        const picName = `${basePicName}_${userId}${picExtension}`;

        // Cv //
        const cvOrginalName = cv.name;
        const baseCvName = cvOrginalName.substring(0, cvOrginalName.lastIndexOf(".")).replaceAll(" ", "_");
        const cvExtension = cvOrginalName.substring(cvOrginalName.lastIndexOf("."));
        const cvName = `${baseCvName}_${userId}${cvExtension}`;

        // Run file writes and database update in parallel
        await Promise.all([
            fs.writeFile(path.join(process.cwd(), "public/assets/images", picName), Buffer.from(await pic.arrayBuffer())),
            fs.writeFile(path.join(process.cwd(), "public/assets/files", cvName), Buffer.from(await cv.arrayBuffer())),
            query({ query: "UPDATE employees SET pic = ?, cv = ? WHERE id = ?", values: [picName, cvName, userId], }),
        ]);

        return NextResponse.json({ status: 200, message: 'Your request has been submitted' });
    } catch (error) {
        console.error("Error occurred:", error);
        return NextResponse.json({ message: "Failed", status: 500 });
    }
}

// GET function to retrieve all employees
export async function GET(request) {
    try {
        const employees = await query({ query: 'SELECT * FROM employees', values: [] });

        if (Array.isArray(employees) && employees.length > 0) {
            return NextResponse.json({ status: 200, message: 'Records found', data: employees });
        } else {
            return NextResponse.json({ status: 200, message: 'No Records found', data: [] });
        }
    } catch (error) {
        console.error('An error occurred while retrieving the records:', error);
        return NextResponse.json({ status: 500, message: 'An error occurred while retrieving the records.' });
    }
}