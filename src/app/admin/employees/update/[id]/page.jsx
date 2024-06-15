"use client"
import React, { useState, useEffect } from 'react'
import Sidebar from '@/app/admin/components/Sidebar';
import Header from '@/app/admin/components/Header';
import axios from "axios";
import Swal from "sweetalert2";
import Image from 'next/image';
import { useRouter } from 'next/navigation';

function page({ params }) {
    const router = useRouter();
    const id = params.id;
    console.log("Id: ", id);
    const [formdata, setFormData] = useState({
        name: "",
        email: "",
        salary: "",
        jobType: "",
        gender: "",
        prePic: null,
        currentPic: null,
        preCv: null,
        currentCv: null,
    })

    useEffect(() => {
        console.log("id:", id);
        const getUserRecord = async () => {
            try {
                const response = await axios.get(`/api/employees/${id}`);
                const employeeData = response.data.data[0];
                setFormData({
                    name: employeeData.name,
                    email: employeeData.email,
                    salary: employeeData.salary,
                    jobType: employeeData.jobType,
                    gender: employeeData.gender,
                    prePic: employeeData.pic,
                    preCv: employeeData.cv,
                });
                console.log("response.data.name: ", employeeData);
            } catch (error) {
                console.log("error", error);
            }
        }

        getUserRecord();
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();

        if (!formdata.name || !formdata.email || !formdata.salary || !formdata.jobType || !formdata.gender) {
            Swal.fire({
                icon: "error",
                title: "Validation Error",
                text: "Please fill the required fields",
            });
        }

        const formData = new FormData();
        formData.append('name', formdata.name);
        formData.append('email', formdata.email);
        formData.append('salary', formdata.salary);
        formData.append('jobType', formdata.jobType);
        formData.append('gender', formdata.gender);
        formData.append('prePic', formdata.prePic);
        formData.append('pic', formdata.pic);
        formData.append('preCv', formdata.preCv);
        formData.append('cv', formdata.cv);

        console.log("FormData: ", formData);

        try {
            const response = await axios.put(`/api/employees/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log("response.data: ", response.data)
            console.log("response.data: ", response.data.status);

            if (response.data.status === 200) {
                Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: response.data.message,
                }).then(() => {
                    router.push("./../../../../admin/employees/list"); 
                });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: response.data.message,
                });
            }
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error.response ? error.response.data.message : "An error occurred",
            });
        }
    }

    return (

        <div className="flex flex-col md:flex-row h-screen">
            <Sidebar overview="../../../../admin/overview" employeeList="../../../../admin/employees/list"></Sidebar>
            <div className="flex-1 overflow-auto bg-gray-100">
                <Header></Header>
                <div className='p-6'>
                    <div className='mx-auto max-w-[860px]'>
                        <h1 className='text-2xl font-semibold text-center'>Update Employee Record</h1>
                        <form onSubmit={handleUpdate} name="employeeForm" id="employeeForm" class="bg-white shadow-md rounded px-8 pb-8 mb-4 py-4 mt-2"
                            method="post" enctype="multipart/form-data">
                            <div className='flex flex-row justify-between space-x-4 mb-4'>
                                <div class="flex-1">
                                    <label class="block text-gray-700 text-sm font-bold mb-2" for="username">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        name="name"
                                        id="name"
                                        value={formdata.name}
                                        onChange={(e) => setFormData({ ...formdata, name: e.target.value })}
                                        placeholder="Enter Employee Name" />
                                </div>
                                <div class="flex-1">
                                    <label class="block text-gray-700 text-sm font-bold mb-2" for="username">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        name="email"
                                        id="email"
                                        value={formdata.email}
                                        onChange={(e) => setFormData({ ...formdata, email: e.target.value })}
                                        placeholder="Enter Employee Email" />

                                </div>
                            </div>
                            <div className='flex flex-row justify-between space-x-4 mb-4'>
                                <div class="flex-1">
                                    <label class="block text-gray-700 text-sm font-bold mb-2" for="username">
                                        Salary
                                    </label>
                                    <input
                                        type="number"
                                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        name="salary"
                                        id="salary"
                                        value={formdata.salary}
                                        onChange={(e) => setFormData({ ...formdata, salary: e.target.value })}
                                        placeholder="Enter Employee Salary" />
                                </div>
                                <div class="flex-1">
                                    <label class="block text-gray-700 text-sm font-bold mb-2" for="username">
                                        Job Type
                                    </label>
                                    <select
                                        class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        name="jobType"
                                        id="jobType"
                                        value={formdata.jobType}
                                        onChange={(e) => setFormData({ ...formdata, jobType: e.target.value })}
                                    >
                                        <option disabled selected>Select Job Type</option>
                                        <option value="Part Time">Part Time</option>
                                        <option value="Full Time">Full Time</option>
                                    </select>
                                </div>
                            </div>
                            <div className='flex flex-row justify-between space-x-4 mb-4'>
                                <div className="flex-1 flex-row">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        Gender
                                    </label>
                                    <div className="flex items-center">
                                        <input
                                            type="radio"
                                            className="shadow mx-3"
                                            name="gender"
                                            value="Male"
                                            checked={formdata.gender === "Male"}
                                            onChange={(e) => setFormData({ ...formdata, gender: e.target.value })}
                                        /> Male
                                        <input
                                            type="radio"
                                            className="shadow ml-12 mx-3"
                                            name="gender"
                                            value="Female"
                                            checked={formdata.gender === "Female"}
                                            onChange={(e) => setFormData({ ...formdata, gender: e.target.value })}
                                        /> Female
                                    </div>
                                </div>
                            </div>
                            <div className='flex flex-row justify-between space-x-4 mb-4'>
                                <div class="flex-1">
                                    <label class="block text-gray-700 text-sm font-bold mb-2" for="username">
                                        Employee Pic
                                    </label>
                                    <Image src={`/assets/images/${formdata.prePic}`} alt="employee pic" width={100} height={100} className='text-center mx-auto' />
                                    <input
                                        type="file"
                                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        name="pic"
                                        id="pic"
                                        files={formdata.pic}
                                        onChange={(e) => setFormData({ ...formdata, pic: e.target.files[0] })} />
                                </div>
                                <div class="flex-1">
                                    <label class="block text-gray-700 text-sm font-bold mb-2" for="username">
                                        Employee Cv
                                    </label>
                                    <p className='my-5'>{formdata.preCv}</p>
                                    <input
                                        type="file"
                                        class="shadow appearance-none border rounded w-96 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        name="cv"
                                        id="cv"
                                        onChange={(e) => setFormData({ ...formdata, cv: e.target.files[0] })} />
                                </div>
                            </div>
                            <div class="flex items-center justify-between">
                                <button
                                    class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                    type="submit">
                                    Update Employee
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default page