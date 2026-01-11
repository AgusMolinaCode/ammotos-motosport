import React from "react";

interface PageProps {
  params: Promise<{ id: string; idProduct: string }>;
}

const page = async ({ params }: PageProps) => {
  const { id, idProduct } = await params;

  return (
    <div>
      Brand Detail Page - Brand ID: {id} - Product ID: {idProduct}
    </div>
  );
};

export default page;
