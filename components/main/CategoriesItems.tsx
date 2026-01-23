import React from "react";
import Link from "next/link";
import {
  CATEGORIES_EN_TO_ES,
  type CategoryES,
} from "@/constants/categorias-es";

interface CategoryItem {
  id: string;
  nameES: CategoryES;
}

const categoriesList: CategoryItem[] = Object.entries(CATEGORIES_EN_TO_ES).map(
  ([id, nameES]) => ({
    id,
    nameES,
  }),
);

const CategoriesItems = () => {
  return (
    <div className="max-w-[110rem] mx-auto">
      <h1 className="text-2xl md:text-4xl underline font-bold">
        Categorías de Productos
      </h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 pt-20">
        {categoriesList.map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.id}`}
            className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer block"
          >
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {category.nameES}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoriesItems;
