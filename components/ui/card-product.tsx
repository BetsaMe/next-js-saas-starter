import Link from "next/link";
import { Heart } from "lucide-react";

interface CardProductProps {
  id: string | number;
  description: string
  title: string;
  price: number;
  imageUrl?: string | null;
  sellerName?: string | null;
}

export default function CardProduct({
  id,
  title,
  description,
  price,
  imageUrl,
  sellerName,
}: CardProductProps) {
  return (
    <Link
      href={`/listings/${id}`}
      className="air-card shadow-01 block p-4
    rounded-lghover:shadow-md transition relative"
    >
      {imageUrl && (
        <img
          src={imageUrl}
          alt={title}
          className="mt-2 w-full h-40 object-cover rounded"
        />
      )}
      <div className="">
        <div className="flex justify-between mt-6">
          <h4 className="text-lg font-medium">{title}</h4>{" "}
          <div className="bg-gray-200 w-9 h-9 min-w-9 flex items-center justify-center rounded-full">
            <Heart className="w-4.5 h-4.5  text-gray-700"></Heart>
          </div>
        </div>
        <p className="text-gray-600 text-sm">{description}</p>

        <button className="bg-red-400 rounded-full px-3 py-1 text-[11px] 
        uppercase text-black font-semibold absolute top-8 left-6">
          for sale
        </button>
      </div>
      <p className="text-sm text-gray-500 mt-1">
        Seller: {sellerName ?? "usuario"}
      </p><hr className="border-t border-gray-300 my-4" />

      <p className="text-gray-600 text-lg text-right">Price: €{price}</p>
    </Link>
  );
}
