import { Pencil, WandSparkles, X } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";

interface ImagePlaceHolderProps {
  size: string;
  small?: boolean;
  onImageChange: (file: File | null, index: number) => void;
  onRemove?: (index: number) => void;
  defaultImage?: string;
  index?: any;
  setOpenImageModal: (openImageModal: boolean) => void;
}

const ImagePlaceHolder = ({ props }: { props: ImagePlaceHolderProps }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(
    props.defaultImage!
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      props.onImageChange(file, props.index!);
    }
  };

  return (
    <div
      className={`relative ${
        props.small ? "h-[180px]" : "h-[450px]"
      } w-full cursor-pointer bg-[#1e1e1e] border border-gray-600 rounded-lg flex flex-col justify-center items-center`}
    >
      <input
        type="file"
        accept="image/*"
        className="hidden"
        id={`image-upload-${props.index}`}
        onChange={handleFileChange}
      />
      {imagePreview ? (
        <>
          <button
            type="button"
            onClick={() => props.onRemove?.(props.index!)}
            className="absolute top-3 right-3 p-2 !rounded bg-red-600 shadow-lg"
          >
            <X size={16} />
          </button>
          <button
            className="absolute top-3 right-[70px] p-2 ! rounded bg-blue-500 shadow-lg cursor-pointer"
            onClick={() => props.setOpenImageModal}
          >
            <WandSparkles size={16} />
          </button>
        </>
      ) : (
        <label
          htmlFor={`image-upload-${props.index}`}
          className="absolute top-3 right-3 p-2 !rounded bg-slate-700 shadow-lg cursor-pointer"
        >
          <Pencil size={16} />
        </label>
      )}

      {imagePreview ? (
        <Image
          width={400}
          height={300}
          src={imagePreview}
          alt="uploaded"
          className="w-full h-full object-cover rounded-lg"
        />
      ) : (
        <>
          <p
            className={`text-gray-400 ${
              props.small ? "text-xl" : "text-4xl"
            } font-semibold`}
          >
            {props.size}
          </p>
          <p
            className={`text-gray-500 ${
              props.small ? "text-sm" : "text-lg"
            } pt-2 text-center`}
          >
            Please choose an image <br /> according to the expected ratio
          </p>
        </>
      )}
    </div>
  );
};

export default ImagePlaceHolder;
