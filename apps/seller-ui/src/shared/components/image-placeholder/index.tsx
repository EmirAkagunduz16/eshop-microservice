import { Pencil, WandSparkles, X } from "lucide-react";
import Image from "next/image";
import React, { useState, useEffect } from "react";

interface ImagePlaceHolderProps {
  size: string;
  small?: boolean;
  onImageChange: (file: File | null, index: number) => void;
  onRemove?: (index: number) => void;
  defaultImage?: string;
  selectedImage?: string;
  images: any;
  pictureUploadingLoader: boolean;
  setSelectedImage: (image: string) => void;
  index?: any;
  setOpenImageModal: (openImageModal: boolean) => void;
}

const ImagePlaceHolder = ({ props }: { props: ImagePlaceHolderProps }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(
    props.defaultImage!
  );

  // props.images değiştiğinde imagePreview'i güncelle
  useEffect(() => {
    const currentImage = props.images[props.index!];
    if (currentImage && currentImage.file_url) {
      setImagePreview(currentImage.file_url);
    } else {
      setImagePreview(null);
    }
  }, [props.images, props.index]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      props.onImageChange(file, props.index!);
    }
  };

  // Görsel ImageKit'e yüklenmiş mi kontrol et
  const currentImage = props.images[props.index!];
  const isImageUploaded = currentImage && currentImage.file_url;

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
          {/* Loading overlay */}
          {props.pictureUploadingLoader && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center rounded-lg z-10">
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
                <p className="text-white text-sm">Yükleniyor...</p>
              </div>
            </div>
          )}
          
          <button
            type="button"
            disabled={props.pictureUploadingLoader}
            onClick={() => props.onRemove?.(props.index!)}
            className="absolute top-3 right-3 p-2 !rounded bg-red-600 shadow-lg z-20"
          >
            <X size={16} />
          </button>
          {/* AI enhancement butonunu sadece görsel ImageKit'e yüklendiyse göster */}
          {isImageUploaded && (
            <button
              disabled={props.pictureUploadingLoader}
              className="absolute top-3 right-[70px] p-2 !rounded bg-blue-500 shadow-lg cursor-pointer z-20"
              onClick={() => {
                if (currentImage && currentImage.file_url) {
                  props.setOpenImageModal(true);
                  props.setSelectedImage(currentImage.file_url);
                }
              }}
            >
              <WandSparkles size={16} />
            </button>
          )}
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
