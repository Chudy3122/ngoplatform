"use client"

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "react-toastify";
import dynamic from "next/dynamic";
import { FormContainerProps } from "./FormContainer";
import {
 deleteClass,
 deleteExam,
 deleteStudent,
 deleteSubject,
 deleteTeacher,
} from "@/lib/actions";

const TeacherForm = dynamic(() => import("./forms/TeacherForm"), {
 loading: () => <h1>Loading...</h1>,
});
const StudentForm = dynamic(() => import("./forms/StudentForm"), {
 loading: () => <h1>Loading...</h1>,
});
const SubjectForm = dynamic(() => import("./forms/SubjectForm"), {
 loading: () => <h1>Loading...</h1>,
});
const ClassForm = dynamic(() => import("./forms/ClassForm"), {
 loading: () => <h1>Loading...</h1>,
});
const ExamForm = dynamic(() => import("./forms/ExamForm"), {
 loading: () => <h1>Loading...</h1>,
});

type DeleteActions = {
 [K in FormContainerProps['table']]?: (currentState: any, data: FormData) => Promise<{ success: boolean; error: boolean }>;
};

const deleteActionMap: DeleteActions = {
 subject: deleteSubject,
 class: deleteClass,
 teacher: deleteTeacher,
 student: deleteStudent,
 exam: deleteExam,
};

type FormComponent = {
 setOpen: Dispatch<SetStateAction<boolean>>;
 type: "create" | "update";
 data?: any;
 relatedData?: any;
};

const forms: {
 [key: string]: (
   setOpen: Dispatch<SetStateAction<boolean>>,
   type: "create" | "update",
   data?: any,
   relatedData?: any
 ) => JSX.Element;
} = {
 subject: (setOpen, type, data, relatedData) => (
   <SubjectForm
     setOpen={setOpen}
     type={type}
     data={data}
     relatedData={relatedData}
   />
 ),
 class: (setOpen, type, data, relatedData) => (
   <ClassForm
     type={type}
     data={data}
     setOpen={setOpen}
     relatedData={relatedData}
   />
 ),
 teacher: (setOpen, type, data, relatedData) => (
   <TeacherForm
     type={type}
     data={data}
     setOpen={setOpen}
     relatedData={relatedData}
   />
 ),
 student: (setOpen, type, data, relatedData) => (
   <StudentForm
     type={type}
     data={data}
     setOpen={setOpen}
     relatedData={relatedData}
   />
 ),
 exam: (setOpen, type, data, relatedData) => (
   <ExamForm
     type={type}
     data={data}
     setOpen={setOpen}
     relatedData={relatedData}
   />
 ),
};

const FormModal = ({
 table,
 type,
 data,
 id,
 relatedData,
}: FormContainerProps & { relatedData?: any }) => {
 const [open, setOpen] = useState(false);
 const size = type === "create" ? "w-8 h-8" : "w-7 h-7";
 const bgColor =
   type === "create"
     ? "bg-lamaYellow"
     : type === "update"
     ? "bg-lamaSky"
     : "bg-lamaPurple";

 const Form = () => {
   const [state, formAction] = useFormState(
     deleteActionMap[table] || (() => Promise.resolve({ success: false, error: true })),
     { success: false, error: false }
   );
   const router = useRouter();

   useEffect(() => {
     if (state.success) {
       toast(`${table} has been deleted!`);
       setOpen(false);
       router.refresh();
     }
   }, [state, router]);

   if (type === "delete" && id) {
     return (
       <form action={formAction} className="p-4 flex flex-col gap-4">
         <input type="text" name="id" value={id} hidden />
         <span className="text-center font-medium">
           All data will be lost. Are you sure you want to delete this {table}?
         </span>
         <button className="bg-red-700 text-white py-2 px-4 rounded-md border-none w-max self-center">
           Delete
         </button>
       </form>
     );
   }

   if (type === "create" || type === "update") {
     const FormComponent = forms[table];
     return FormComponent ? (
       FormComponent(setOpen, type, data, relatedData)
     ) : (
       <p>Form not found for {table}</p>
     );
   }

   return <p>Invalid form type</p>;
 };

 return (
   <>
     <button
       className={`${size} flex items-center justify-center rounded-full ${bgColor}`}
       onClick={() => setOpen(true)}
     >
       <Image src={`/${type}.png`} alt="" width={16} height={16} />
     </button>
     {open && (
       <div className="w-screen h-screen absolute left-0 top-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
         <div className="bg-white p-4 rounded-md relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%]">
           <Form />
           <div
             className="absolute top-4 right-4 cursor-pointer"
             onClick={() => setOpen(false)}
           >
             <Image src="/close.png" alt="" width={14} height={14} />
           </div>
         </div>
       </div>
     )}
   </>
 );
};

export default FormModal;