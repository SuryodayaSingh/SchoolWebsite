"use client";

import Image, { StaticImageData } from "next/image";
import { useState } from "react";

import image1 from "@/app/asset/image.png";
import image2 from "@/app/asset/image2.png";
import image3 from "@/app/asset/image3.png";
import image4 from "@/app/asset/image4.png";
import image5 from "@/app/asset/image5.png";
import image6 from "@/app/asset/image6.png";
import image7 from "@/app/asset/image7.png";

const defaultImages = [
  image1,
  image2,
  image3,
  image4,
  image5,
  image6,
  image7,
];

type GalleryImage = StaticImageData | string;

function Gallery() {
  const [images, setImages] =
    useState<GalleryImage[]>(defaultImages);

  const [selectedImage, setSelectedImage] =
    useState<GalleryImage | null>(null);

  // DEVICE SE IMAGE ADD KARNA
  function handleImageUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const files = e.target.files;

    if (!files || files.length === 0) return;

    const newImages: string[] = [];

    Array.from(files).forEach((file) => {
      // Sirf images allow
      if (!file.type.startsWith("image/")) {
        return;
      }

      // Device image ka temporary URL
      const imageUrl = URL.createObjectURL(file);

      newImages.push(imageUrl);
    });

    setImages((prev) => [...prev, ...newImages]);

    // Same image dobara select karne ke liye
    e.target.value = "";
  }

  return (
    <>
      <div className="max-w-7xl mx-auto p-4">
        {/* HEADER + ADD PHOTO BUTTON */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              फोटो गैलरी
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              विद्यालय की तस्वीरें
            </p>
          </div>

          {/* DEVICE IMAGE UPLOAD */}
          <label className="inline-flex w-fit items-center justify-center gap-2 px-5 py-3 bg-[#574f87] hover:bg-[#463f70] text-white rounded-lg font-semibold cursor-pointer transition">
            <span className="text-xl">+</span>
            फोटो जोड़ें

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* GALLERY */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div
              key={index}
              onClick={() => setSelectedImage(image)}
              className="cursor-pointer overflow-hidden rounded-xl shadow-md bg-gray-100 aspect-square"
            >
              <Image
                src={image}
                alt={`Gallery image ${index + 1}`}
                width={500}
                height={500}
                unoptimized={typeof image === "string"}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>

        {/* EMPTY STATE */}
        {images.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            अभी कोई फोटो उपलब्ध नहीं है।
          </div>
        )}
      </div>

      {/* POPUP */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        >
          <div
            className="relative max-w-5xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* CLOSE BUTTON */}
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white text-3xl font-bold cursor-pointer hover:text-gray-300"
              aria-label="Close image"
            >
              ✕
            </button>

            <Image
              src={selectedImage}
              alt="Selected image"
              width={1200}
              height={900}
              unoptimized={typeof selectedImage === "string"}
              className="max-h-[85vh] w-auto max-w-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  );
}

export default Gallery;