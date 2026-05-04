// src/app/context/Ecommercecontext/index.tsx
"use client";

import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import useSWR from "swr";
import { ProductType } from "@/app/[locale]/(DashboardLayout)/types/apps/eCommerce";
import {
  getWebFetcher,
  postWebFetcher,
  putWebFetcher,
  deleteWebFetcher,
} from "@/utils/fetchers.web.client";

interface ProductContextType {
  products: ProductType[];
  searchProduct: string;
  selectedCategory: string;
  sortBy: string;
  priceRange: string;
  selectedGender: string;
  selectedColor: string;
  loading: boolean;
  error: Error | null;
  cartItems: ProductType[];
  setProducts: React.Dispatch<React.SetStateAction<ProductType[]>>;
  setSearchProduct: React.Dispatch<React.SetStateAction<string>>;
  setSelectedCategory: React.Dispatch<React.SetStateAction<string>>;
  setSortBy: React.Dispatch<React.SetStateAction<string>>;
  setPriceRange: React.Dispatch<React.SetStateAction<string>>;
  setSelectedGender: React.Dispatch<React.SetStateAction<string>>;
  setSelectedColor: React.Dispatch<React.SetStateAction<string>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setCartItems: React.Dispatch<React.SetStateAction<ProductType[]>>;
  deleteProduct: (productId: number | string) => void;
  searchProducts: (searchText: string) => void;
  updateSortBy: (sortOption: string) => void;
  updatePriceRange: (range: string) => void;
  selectCategory: (category: string) => void;
  selectGender: (gender: string) => void;
  selectColor: (color: string) => void;
  incrementQuantity: (id: number | string) => Promise<void>;
  decrementQuantity: (id: number | string) => Promise<void>;
  removeFromCart: (id: number | string) => Promise<void>;
  addToCart: (item: number | string) => Promise<void>;
  deleteAllProducts: () => void;
  filteredAndSortedProducts: ProductType[];
  filterReset: () => void;
  getProductById: (productId: string) => ProductType | undefined;
  updateProduct: (productId: string, updatedProduct: ProductType) => void;
}

export const ProductContext = createContext<ProductContextType | null>(null);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [searchProduct, setSearchProduct] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState("All");
  const [selectedGender, setSelectedGender] = useState("All");
  const [selectedColor, setSelectedColor] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [cartItems, setCartItems] = useState<ProductType[]>([]);

  const {
    data: productsData,
    isLoading: isProductsLoading,
    error: productsError,
  } = useSWR("/api/eCommerce", getWebFetcher);

  const {
    data: cartsData,
    isLoading: isCartsLoading,
    error: cartsError,
    mutate: cartMutate,
  } = useSWR("/api/eCommerce/carts", getWebFetcher);

  useEffect(() => {
    const storedCartItems = localStorage.getItem("cartItems");
    if (!storedCartItems) return;

    try {
      const parsed = JSON.parse(storedCartItems);
      if (Array.isArray(parsed)) {
        setCartItems(parsed);
      }
    } catch {
      localStorage.removeItem("cartItems");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    setLoading(isProductsLoading || isCartsLoading);
  }, [isProductsLoading, isCartsLoading]);

  useEffect(() => {
    if (productsError) {
      setError(productsError);
      return;
    }
    if (cartsError) {
      setError(cartsError);
      return;
    }
    setError(null);
  }, [productsError, cartsError]);

  useEffect(() => {
    if (productsData?.data) {
      setProducts(productsData.data);
    }
  }, [productsData]);

  useEffect(() => {
    if (cartsData?.data) {
      setCartItems(cartsData.data);
    }
  }, [cartsData]);

  const filterProducts = useCallback(
    (product: ProductType) => {
      const matchesSearch = product.title
        .toLowerCase()
        .includes(searchProduct.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" || product.category.includes(selectedCategory);

      const withinPriceRange =
        priceRange === "All" ||
        (priceRange === "0-50" && product.price <= 50) ||
        (priceRange === "50-100" && product.price > 50 && product.price <= 100) ||
        (priceRange === "100-200" && product.price > 100 && product.price <= 200) ||
        (priceRange === "200-99999" && product.price > 200);

      const matchesGender =
        selectedGender === "All" || product.gender === selectedGender;

      const matchesColor =
        selectedColor === "All" || product.colors.includes(selectedColor);

      return (
        matchesSearch &&
        matchesCategory &&
        withinPriceRange &&
        matchesGender &&
        matchesColor
      );
    },
    [priceRange, searchProduct, selectedCategory, selectedColor, selectedGender]
  );

  const sortProducts = useCallback(
    (items: ProductType[]) => {
      const cloned = [...items];

      switch (sortBy) {
        case "newest":
          return cloned.sort(
            (a, b) =>
              new Date(b.created).getTime() - new Date(a.created).getTime()
          );
        case "priceDesc":
          return cloned.sort((a, b) => b.price - a.price);
        case "priceAsc":
          return cloned.sort((a, b) => a.price - b.price);
        case "discount":
          return cloned.sort((a, b) => (b.discount || 0) - (a.discount || 0));
        default:
          return cloned;
      }
    },
    [sortBy]
  );

  const filteredAndSortedProducts = useMemo(() => {
    return sortProducts(products.filter(filterProducts));
  }, [products, filterProducts, sortProducts]);

  const getProductById = useCallback(
    (productId: string) => products.find((p) => p.id === Number(productId)),
    [products]
  );

  const selectCategory = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  const updateSortBy = useCallback((sortOption: string) => {
    setSortBy(sortOption);
  }, []);

  const updatePriceRange = useCallback((range: string) => {
    setPriceRange(range);
  }, []);

  const selectGender = useCallback((gender: string) => {
    setSelectedGender(gender);
  }, []);

  const selectColor = useCallback((color: string) => {
    setSelectedColor(color);
  }, []);

  const searchProducts = useCallback((searchText: string) => {
    setSearchProduct(searchText);
  }, []);

  const addToCart = useCallback(async (productId: number | string) => {
    await cartMutate(postWebFetcher("/api/eCommerce/carts", { productId }), {
      revalidate: true,
    });
  }, [cartMutate]);

  const removeFromCart = useCallback(async (id: number | string) => {
    await cartMutate(deleteWebFetcher("/api/eCommerce/carts", { id }), {
      revalidate: true,
    });
  }, [cartMutate]);

  const incrementQuantity = useCallback(async (id: number | string) => {
    await cartMutate(putWebFetcher("/api/eCommerce/carts", { id, action: "Increment" }), {
      revalidate: true,
    });
  }, [cartMutate]);

  const decrementQuantity = useCallback(async (id: number | string) => {
    await cartMutate(putWebFetcher("/api/eCommerce/carts", { id, action: "Decrement" }), {
      revalidate: true,
    });
  }, [cartMutate]);

  const deleteProduct = useCallback((productId: number | string) => {
    setProducts((prev) => prev.filter((product) => product.id !== productId));
  }, []);

  const deleteAllProducts = useCallback(() => {
    setProducts([]);
  }, []);

  const updateProduct = useCallback((productId: string, updatedProduct: ProductType) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === Number(productId) ? updatedProduct : product
      )
    );
  }, []);

  const filterReset = useCallback(() => {
    setSelectedCategory("All");
    setSelectedColor("All");
    setSelectedGender("All");
    setPriceRange("All");
    setSortBy("newest");
  }, []);

  const value = useMemo<ProductContextType>(
    () => ({
      products,
      searchProduct,
      selectedCategory,
      sortBy,
      priceRange,
      selectedGender,
      selectedColor,
      loading,
      error,
      cartItems,
      setProducts,
      setSearchProduct,
      setSelectedCategory,
      setSortBy,
      setPriceRange,
      setSelectedGender,
      setSelectedColor,
      setLoading,
      setCartItems,
      deleteProduct,
      searchProducts,
      updateSortBy,
      updatePriceRange,
      selectCategory,
      selectGender,
      selectColor,
      incrementQuantity,
      decrementQuantity,
      removeFromCart,
      addToCart,
      deleteAllProducts,
      filteredAndSortedProducts,
      filterReset,
      getProductById,
      updateProduct,
    }),
    [
      products,
      searchProduct,
      selectedCategory,
      sortBy,
      priceRange,
      selectedGender,
      selectedColor,
      loading,
      error,
      cartItems,
      deleteProduct,
      searchProducts,
      updateSortBy,
      updatePriceRange,
      selectCategory,
      selectGender,
      selectColor,
      incrementQuantity,
      decrementQuantity,
      removeFromCart,
      addToCart,
      deleteAllProducts,
      filteredAndSortedProducts,
      filterReset,
      getProductById,
      updateProduct,
    ]
  );

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
};