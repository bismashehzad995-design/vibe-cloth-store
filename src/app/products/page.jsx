import { Suspense } from "react";
import ProductsContent from "./ProductsContent";

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="text-center py-10">Loading products...</div>}>
      <ProductsContent />
    </Suspense>
  );
}