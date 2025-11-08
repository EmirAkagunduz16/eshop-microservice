import { useMutation } from "@tanstack/react-query";
import { shopCategories } from "apps/seller-ui/src/app/utils/categories";
import axios from "axios";
import React from "react";
import { useForm } from "react-hook-form";

const CreateShop = ({
  sellerId,
  setActiveStep,
}: {
  sellerId: string;
  setActiveStep: (step: number) => void;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const shopCreateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/create-shop`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      setActiveStep(3);
    },
  });

  const onSubmit = async (data: any) => {
    const shopData = { ...data, sellerId };
    shopCreateMutation.mutate(shopData);
  };

  const countWords = (text: string) =>
    text.trim().split(/\s+/).length <= 100 || "Bio must be less than 100 words";

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <h3 className="text-2xl font-semibold text-center mb-4">
          Setup new shop
        </h3>

        <label className="block text-gray-700 mb-1">Name *</label>
        <input
          type="text"
          placeholder="shop name"
          className="w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-1"
          {...register("name", { required: "Name is required" })}
        />
        {errors.name && (
          <p className="text-red-500 text-sm mb-2">
            {errors.name.message as string}
          </p>
        )}

        <label className="block text-gray-700 mb-1">Bio (Max 100 words)*</label>
        <input
          type="text"
          placeholder="Shop bio"
          className="w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-1"
          {...register("bio", {
            required: "Shop bio is required",
            validate: (value) => countWords(value),
          })}
        />

        {errors.bio && (
          <p className="text-red-500 text-sm mb-2">
            {errors.bio.message as string}
          </p>
        )}

        <label className="block text-gray-700 mb-1">Address *</label>
        <input
          type="text"
          placeholder="Shop address"
          className="w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-1"
          {...register("address", { required: "Address is required" })}
        />
        {errors.address && (
          <p className="text-red-500 text-sm mb-2">
            {errors.address.message as string}
          </p>
        )}

        <label className="block text-gray-700 mb-1">Opening Hours *</label>
        <input
          type="text"
          placeholder="e.g., Mon-Fri 9am-6pm"
          className="w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-1"
          {...register("opening_hours", {
            required: "Opening hours is required",
          })}
        />
        {errors.opening_hours && (
          <p className="text-red-500 text-sm mb-2">
            {errors.opening_hours.message as string}
          </p>
        )}

        <label className="block text-gray-700 mb-1">Website *</label>
        <input
          type="text"
          placeholder="https://example.com"
          className="w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-1"
          {...register("website", {
            required: "Website is required",
            pattern: {
              value: /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(\/[\w-]*)*\/?$/,
              message: "Enter a valid website URL",
            },
          })}
        />
        {errors.website && (
          <p className="text-red-500 text-sm mb-2">
            {errors.website.message as string}
          </p>
        )}

        <label className="block text-gray-700 mb-1">Category *</label>
        <select
          className="w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-1"
          {...register("category", { required: "Category is required" })}
        >
          <option value="">Select category</option>
          {shopCategories.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="text-red-500 text-sm mb-2">
            {errors.category.message as string}
          </p>
        )}

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded-[4px] mt-4 hover:bg-blue-600 transition"
          // disabled={shopCreateMutation.isLoading}
        >
          {/* {shopCreateMutation.isLoading ? "Creating Shop..." : "Create Shop"}
           */}
          Create Shop
        </button>
      </form>
    </div>
  );
};

export default CreateShop;
