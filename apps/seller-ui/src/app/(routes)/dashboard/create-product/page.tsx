"use client";

import { useQuery } from "@tanstack/react-query";
import ImagePlaceHolder from "apps/seller-ui/src/shared/components/image-placeholder";
import { ChevronRight, Wand, X } from "lucide-react";
import ColorSelector from "packages/components/color-selector";
import CustomProperties from "packages/components/custom-properties";
import CustomSpecifications from "packages/components/custom-specifications";
import Input from "packages/components/input";
import React, { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import axiosInstance from "../../../utils/axiosInstance";
import dynamic from "next/dynamic";
import SizeSelector from "packages/components/size-selector";
import Image from "next/image";
import { enhancements } from "../../../utils/AI.enhancements";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

interface UploadedImage {
  fileId: string;
  file_url: string;
}

const RichTextEditor = dynamic(
  () => import("packages/components/rich-text-editor"),
  { ssr: false }
);

const Page = () => {
  const {
    register,
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [openImageModal, setOpenImageModal] = useState(false);
  const [isChanged, setIsChanged] = useState(true);
  const [activeEffect, setActiveEffect] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [pictureUploadingLoader, setPictureUploadingLoader] = useState(false);
  const [images, setImages] = useState<(UploadedImage | null)[]>([null]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  const router = useRouter();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get("/product/api/get-categories");
        return res.data;
      } catch (error) {
        console.log(error);
        return { categories: [], subCategories: {} };
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  const { data: discountCodes = [], isLoading: discountCodesLoading } =
    useQuery({
      queryKey: ["shop-discount"],
      queryFn: async () => {
        const response = await axiosInstance.get(
          "/product/api/get-discount-codes"
        );
        return response?.data?.discount_codes || [];
      },
    });

  const categories = data?.categories || [];
  const subCategoriesData = data?.subCategories || {};

  const selectedCategory = watch("category");
  const regularPrice = watch("regular_price");

  const subCategories = useMemo(() => {
    return selectedCategory ? subCategoriesData[selectedCategory] || [] : [];
  }, [selectedCategory, subCategoriesData]);

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);

      // Clean up the data before sending
      const cleanedData = {
        ...data,
        // Filter out null values from images array
        images: (data.images || []).filter((img: any) => img !== null),
        // Ensure subCategory is correctly named for backend
        subCategory: data.sub_category || data.subCategory,
      };

      // Remove the old field name if it exists
      delete cleanedData.sub_category;

      const response = await axiosInstance.post(
        "/product/api/create-product",
        cleanedData
      );
      if (response.data.success) {
        router.push("/dashboard/all-products");
        toast.success("Product created successfully");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  const convertFileToBase64 = (file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageChange = async (file: File | null, index: number) => {
    if (!file) return;
    setPictureUploadingLoader(true);

    try {
      const fileName = await convertFileToBase64(file);

      const response = await axiosInstance.post(
        "/product/api/upload-product-image",
        { fileName }
      );

      const uploadedImage = {
        fileId: response.data.fileName,
        file_url: response.data.file_url,
      };

      const updatedImages = [...images];

      updatedImages[index] = uploadedImage;

      if (index === images.length - 1 && updatedImages.length < 8) {
        updatedImages.push(null);
      }

      setImages(updatedImages);
      setValue("images", updatedImages);
    } catch (error) {
      console.log(error);
    } finally {
      setPictureUploadingLoader(false);
    }
  };

  const handleRemoveImage = async (index: number) => {
    try {
      const updatedImages = [...images];

      const imageToDelete = updatedImages[index];
      if (imageToDelete && typeof imageToDelete === "object") {
        // delete our picture
        await axiosInstance.delete("/product/api/delete-product-image", {
          data: { fileId: imageToDelete.fileId },
        });
      }

      updatedImages.splice(index, 1);

      // Add null placeholder
      if (!updatedImages.includes(null) && updatedImages.length < 8) {
        updatedImages.push(null);
      }

      setImages(updatedImages);
      setValue("images", updatedImages);
    } catch (error) {
      console.log(error);
    }
  };

  const applyTransformation = async (transformation: string) => {
    if (!selectedImage || processing) return;
    setProcessing(true);
    setActiveEffect(transformation);

    try {
      const transformedUrl = `${selectedImage}?tr=${transformation}`;
      setSelectedImage(transformedUrl);
    } catch (error) {
      console.log(error);
    } finally {
      setProcessing(false);
    }
  };

  const handleSaveDraft = () => {};

  return (
    <form
      className="w-full mx-auto p-8 shadow-md rounded-lg text-white"
      onSubmit={handleSubmit(onSubmit)}
    >
      {/* Heading & Breadcrumbs */}
      <h2 className="tex-2xl py-2 font-semibold font-Poppins text-white">
        Create Product
      </h2>
      <div className="flex items-center">
        <span className="text-[#80Deea] cursor-pointer">Dashboard</span>
        <ChevronRight size={20} className="opacity-[.8]" />
        <span>Create Product</span>
      </div>

      {/* Content Layout */}
      <div className="py-4 w-full flex gap-6">
        {/* Left Side - Image Upload Section */}
        <div className="md:w-[35%]">
          {images?.length > 0 && (
            <ImagePlaceHolder
              props={{
                setOpenImageModal,
                size: "765 x 850",
                small: false,
                index: 0,
                images: images,
                pictureUploadingLoader,
                setSelectedImage,
                onImageChange: handleImageChange,
                onRemove: handleRemoveImage,
              }}
            />
          )}
          <div className="grid grid-cols-2 gap-3 mt-4">
            {images.slice(1).map((_, index) => (
              <ImagePlaceHolder
                key={index}
                props={{
                  setOpenImageModal,
                  size: "765 x 850",
                  small: true,
                  images: images,
                  pictureUploadingLoader,
                  setSelectedImage,
                  index: index + 1,
                  onImageChange: handleImageChange,
                  onRemove: handleRemoveImage,
                }}
              />
            ))}
          </div>
        </div>

        {/* Right Side - form inputs */}
        <div className="md:w-[65%]">
          <div className="w-full flex gap-6">
            {/* Product Title Input */}
            <div className="w-2/4">
              <Input
                label="Product Title *"
                placeholder="Enter product title"
                {...register("title", { required: "Title is required" })}
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.title.message as string}
                </p>
              )}

              <div className="mt-2">
                <Input
                  type="textarea"
                  rows={7}
                  cols={10}
                  label="Short Description * (Max 150 words"
                  placeholder="Enter product description for quick view"
                  {...register("short_description", {
                    required: "Short description is required",
                    validate: (value) => {
                      const wordCount = value.trim().split(/\s+/).length;
                      return (
                        wordCount <= 150 ||
                        `Short description must be less than 150 words. Currently ${wordCount} words.`
                      );
                    },
                  })}
                />
                {errors.short_description && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.short_description.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <Input
                  label="Tags *"
                  placeholder="apple, flagship"
                  {...register("tags", {
                    required: "Seperate related products tags with a comma,",
                  })}
                />
                {errors.tags && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.tags.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <Input
                  label="warranty *"
                  placeholder="1 Year / No warranty"
                  {...register("warranty", {
                    required: "Warranty is required!",
                  })}
                />
                {errors.warranty && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.warranty.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <Input
                  label="Slug *"
                  placeholder="product_slug"
                  {...register("slug", {
                    required: "Slug is required!",
                    pattern: {
                      value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                      message:
                        "Slug can only contain lowercase letters, numbers, and hyphens.",
                    },
                    minLength: {
                      value: 3,
                      message: "Slug must be at least 3 characters long.",
                    },
                    maxLength: {
                      value: 50,
                      message: "Slug cannot exceed 50 characters.",
                    },
                  })}
                />
                {errors.slug && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.slug.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <Input
                  label="Brand"
                  placeholder="Apple"
                  {...register("brand")}
                />
                {errors.brand && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.brand.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                {/* Color Selector */}
                <ColorSelector control={control} errors={errors} />
              </div>

              <div className="mt-2">
                <CustomSpecifications control={control} errors={errors} />
              </div>

              <div className="mt-2">
                <CustomProperties control={control} errors={errors} />
              </div>

              <div className="mt-2">
                <label className="block font-semibold text-gray-300 mb-1">
                  Cash on Delivery *
                </label>
                <select
                  {...register("cash_on_delivery", {
                    required: "Cash on Delivery is required",
                  })}
                  defaultValue={"yes"}
                  className="w-full border outline border-gray-700 bg-transparent"
                >
                  <option value="yes" className="bg-black">
                    Yes
                  </option>
                  <option value="no" className="bg-black">
                    No
                  </option>
                </select>

                {errors.cash_on_delivery && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.cash_on_delivery.message as string}
                  </p>
                )}
              </div>
            </div>

            <div className="w-2/4">
              <label className="block font-semibold text-gray-300 mb-1">
                Category *
              </label>
              {isLoading ? (
                <p className="text-gray-400">Loading categories...</p>
              ) : isError ? (
                <p className="text-red-500">Error loading categories</p>
              ) : (
                <Controller
                  name="category"
                  control={control}
                  rules={{ required: "Category is required" }}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full border outline border-gray-700 bg-transparent"
                    >
                      <option value="" className="bg-black">
                        Select category
                      </option>
                      {categories.map((category: string) => (
                        <option
                          key={category}
                          value={category}
                          className="bg-black"
                        >
                          {category}
                        </option>
                      ))}
                    </select>
                  )}
                />
              )}

              {errors.category && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.category.message as string}
                </p>
              )}

              <div className="mt-2">
                <label className="block font-semibold text-gray-300 mb-1">
                  Sub Category *
                </label>
                {isLoading ? (
                  <p className="text-gray-400">Loading sub categories...</p>
                ) : isError ? (
                  <p className="text-red-500">Error loading sub categories</p>
                ) : (
                  <Controller
                    name="sub_category"
                    control={control}
                    rules={{ required: "Sub Category is required" }}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full border outline border-gray-700 bg-transparent"
                      >
                        <option value="" className="bg-black">
                          Select sub category
                        </option>
                        {subCategories?.map((subCategory: string) => (
                          <option
                            key={subCategory}
                            value={subCategory}
                            className="bg-black"
                          >
                            {subCategory}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                )}

                {errors.sub_category && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.sub_category.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <label className="block font-semibold text-gray-300 mb-1">
                  Detailed Description * (Min 100 words)
                </label>
                <Controller
                  name="detailed_description"
                  control={control}
                  rules={{
                    required: "Detailed description is required",
                    validate: (value) => {
                      const wordCount = value
                        ?.split(/\s+/)
                        .filter((word: string) => word).length;
                      return (
                        wordCount >= 100 ||
                        `Detailed description must be at least 100 words. Currently ${wordCount} words.`
                      );
                    },
                  }}
                  render={({ field }) => (
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />

                {errors.detailed_description && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.detailed_description.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <Input
                  label="Video URL"
                  placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                  {...register("video_url", {
                    pattern: {
                      value:
                        /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})$/,
                      message: "Enter a valid YouTube video URL.",
                    },
                  })}
                />
                {errors.video_url && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.video_url.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <Input
                  label="Regular Price *"
                  placeholder="20$"
                  {...register("regular_price", {
                    valueAsNumber: true,
                    min: {
                      value: 1,
                      message: "Regular price cannot be less than 1.",
                    },
                    validate: (value) =>
                      !isNaN(value) || "Only numbers are allowed",
                  })}
                />
                {errors.regular_price && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.regular_price.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <Input
                  label="Sale Price *"
                  placeholder="15$"
                  {...register("sale_price", {
                    valueAsNumber: true,
                    min: {
                      value: 1,
                      message: "Sale price cannot be less than 1.",
                    },
                    validate: (value) => {
                      if (isNaN(value)) return "Only numbers are allowed";
                      if (regularPrice && value >= regularPrice) {
                        return "Sale Price must be less than Regular Price";
                      }
                      return true;
                    },
                  })}
                />
                {errors.sale_price && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.sale_price.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <Input
                  label="Stock *"
                  placeholder="100"
                  {...register("stock", {
                    required: "Stock is required",
                    valueAsNumber: true,
                    min: {
                      value: 1,
                      message: "Stock cannot be less than 1.",
                    },
                    max: {
                      value: 1000,
                      message: "Stock cannot exceed 1000.",
                    },
                    validate: (value) => {
                      if (isNaN(value)) return "Only numbers are allowed";
                      if (!Number.isInteger(value))
                        return "Stock must be an integer.";
                      return true;
                    },
                  })}
                />
                {errors.stock && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.stock.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <SizeSelector control={control} errors={errors} />
              </div>

              <div className="mt-3">
                <label className="block font-semibold text-gray-300 mb-1">
                  Select Discount Codes (Optional)
                </label>
                {discountCodesLoading ? (
                  <p className="text-gray-400">Loading discount codes...</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {discountCodes?.map((code: any) => (
                      <button
                        key={code.id}
                        type="button"
                        className={`px-3 py-1 rounded-md text-sm font-semibold border ${
                          watch("discountCodes")?.includes(code.id)
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700"
                        }`}
                        onClick={() => {
                          const currentSelection = watch("discountCodes") || [];
                          const updatedSelection = currentSelection?.includes(
                            code.id
                          )
                            ? currentSelection.filter(
                                (id: string) => id !== code.id
                              )
                            : [...currentSelection, code.id];

                          setValue("discountCodes", updatedSelection);
                        }}
                      >
                        {code?.public_name} ({code.discountValue}
                        {code.discountType === "percentage" ? "%" : "$"})
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {openImageModal && selectedImage && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-[450px] text-white">
            <div className="flex justify-between items-center pb-3 mb-4">
              <h2 className="text-lg font-semibold">Enhance Product Image</h2>
              <X
                size={20}
                className="cursor-pointer"
                onClick={() => setOpenImageModal(false)}
              />
            </div>

            <div className="w-full h-[250px] rounded-md overflow-hidden border border-gray-600 relative">
              <Image
                src={selectedImage}
                alt="product image"
                fill
                className="object-contain"
              />
            </div>
            {selectedImage && (
              <div className="mt-4 space-y-2">
                <h3 className="text-sm text-white font-semibold">
                  AI Enhancements
                </h3>
                <div className="grid grid-cols-2 gap-3 mx-h-[250px] overflow-y-auto">
                  {enhancements?.map(({ label, effect }) => (
                    <button
                      key={effect}
                      className={`p-2 rounded-md flex items-center gap-2 ${
                        activeEffect === effect
                          ? "bg-blue-600 text-white"
                          : "bg-gray-700 hover:bg-gray-600"
                      }`}
                      onClick={() => applyTransformation(effect)}
                      disabled={processing}
                    >
                      <Wand size={18} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-end gap-3">
        {isChanged && (
          <button
            onClick={handleSaveDraft}
            type="button"
            className="px-4 py-2 bg-gray-700 text-white rounded-md"
          >
            Save Draft
          </button>
        )}

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create"}
        </button>
      </div>
    </form>
  );
};

export default Page;
