"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { adminSchema, AdminSchema } from "@/lib/formValidationSchemas";
import { useFormState } from "react-dom";
import { createAdmin, updateAdmin } from "@/lib/actions";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const AdminForm = ({
  type,
  data,
  setOpen,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminSchema>({
    resolver: zodResolver(adminSchema),
  });

  const [imgUrl, setImgUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (res.ok) {
      const data = await res.json();
      setImgUrl(data.url || data.id || "");
    }
    setUploading(false);
  };

  const [state, formAction] = useFormState(
    type === "create" ? createAdmin : updateAdmin,
    { success: false, error: false }
  );

  const onSubmit = handleSubmit((formData) => {
    formAction({ ...formData, img: imgUrl || formData.img });
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Admin has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new admin" : "Update admin"}
      </h1>
      <span className="text-xs text-gray-400 font-medium">
        Authentication Information
      </span>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Username"
          name="username"
          defaultValue={data?.username}
          register={register}
          error={errors?.username}
        />
        <InputField
          label="Email"
          name="email"
          defaultValue={data?.email}
          register={register}
          error={errors?.email}
        />
        <InputField
          label="Password"
          name="password"
          type="password"
          register={register}
          error={errors?.password}
        />
      </div>
      <span className="text-xs text-gray-400 font-medium">
        Personal Information
      </span>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Full Name"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors?.name}
        />
        {data && (
          <InputField
            label="Id"
            name="id"
            defaultValue={data?.id}
            register={register}
            error={errors?.id}
            hidden
          />
        )}
        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-500">Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="text-sm"
            disabled={uploading}
          />
          {uploading && <span className="text-xs text-gray-400">Uploading...</span>}
          {imgUrl && <span className="text-xs text-green-500">✓ Uploaded</span>}
        </div>
      </div>
      {state.error && (
        <span className="text-red-500">Something went wrong!</span>
      )}
      <button className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default AdminForm;
