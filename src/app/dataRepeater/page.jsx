"use client"
import React, { useState } from 'react';
import Swal from "sweetalert2";
import axios from "axios";

function Page() {
    const [fields, setFields] = useState([{ name: '', email: '' }]);

    const handleAddField = () => {
        setFields([...fields, { name: '', email: '' }]);
    };

    const handleRemoveField = (index) => {
        const updatedFields = fields.filter((_, i) => i !== index);
        setFields(updatedFields);
    };

    const handleChange = (index, event) => {
        const updatedFields = fields.map((field, i) =>
            i === index ? { ...field, [event.target.name]: event.target.value } : field
        );
        setFields(updatedFields);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            console.log("1 enter in api");
            const response = await axios.post('/api/repeater', fields);
            console.log("2 enter in api");
            if (response.data.status === 200) {
                Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: response.data.message,
                }).then(() => {
                    // router.push("./../../../../admin/employees/list");
                });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: response.data.message,
                });
            }
        } catch (error) {
            console.log("3 enter in api");
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error,
            });
        }
    };

    return (
        <div className="min-h-screen bg-red-50 p-8">
            <h1 className="text-4xl font-bold text-red-700 mb-6">Form Data Repeater</h1>
            <form onSubmit={handleSubmit} method='post'>
                {fields.map((field, index) => (
                    <div key={index} className="mb-4 p-4 bg-red-100 border border-red-200 rounded">
                        <h2 className="text-2xl font-semibold text-red-600 mb-2">Entry {index + 1}</h2>
                        <div className="mb-2">
                            <label className="block text-red-700">Name</label>
                            <input
                                type="text"
                                name="name"
                                value={field.name}
                                onChange={(event) => handleChange(index, event)}
                                className="w-full px-3 py-2 border border-red-300 rounded focus:outline-none focus:border-red-500"
                            />
                        </div>
                        <div className="mb-2">
                            <label className="block text-red-700">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={field.email}
                                onChange={(event) => handleChange(index, event)}
                                className="w-full px-3 py-2 border border-red-300 rounded focus:outline-none focus:border-red-500"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => handleRemoveField(index)}
                            className="text-red-700 hover:text-red-900"
                        >
                            Remove
                        </button>
                    </div>
                ))}
                <button
                    type="button"
                    onClick={handleAddField}
                    className="mb-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                    Add Entry
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-red-700 text-white rounded hover:bg-red-800 mx-5"
                >
                    Submit
                </button>
            </form>
        </div>
    );
}

export default Page;