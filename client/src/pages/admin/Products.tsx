import { useEffect, useState } from "react";
import { productsApi } from "@/api";
import type { Product } from "@/types";
import { useToast } from "@/contexts/ToastContext";
import Loading from "@/components/common/Loading";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Modal from "@/components/common/Modal";

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  comparePrice: string;
  category: string;
  stock: string;
  images: string;
  tags: string;
}

const emptyForm: ProductFormData = {
  name: "",
  description: "",
  price: "",
  comparePrice: "",
  category: "",
  stock: "",
  images: "",
  tags: "",
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(emptyForm);
  const [formErrors, setFormErrors] = useState<Partial<ProductFormData>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const { success, error } = useToast();

  const fetchProducts = async (q?: string) => {
    setIsLoading(true);
    try {
      const res = await productsApi.list({ search: q, limit: 100 });
      setProducts(res.products ?? []);
    } catch {
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openCreate = () => {
    setEditingProduct(null);
    setFormData(emptyForm);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: String(product.price),
      comparePrice: String(product.comparePrice ?? ""),
      category: product.category,
      stock: String(product.stock),
      images: product.images?.join(", ") ?? product.image ?? "",
      tags: product.tags?.join(", ") ?? "",
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validate = (): boolean => {
    const errs: Partial<ProductFormData> = {};
    if (!formData.name.trim()) errs.name = "Product name is required";
    if (!formData.description.trim())
      errs.description = "Description is required";
    if (
      !formData.price ||
      isNaN(Number(formData.price)) ||
      Number(formData.price) <= 0
    )
      errs.price = "Valid price is required";
    if (!formData.category.trim()) errs.category = "Category is required";
    if (
      !formData.stock ||
      isNaN(Number(formData.stock)) ||
      Number(formData.stock) < 0
    )
      errs.stock = "Valid stock quantity is required";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        comparePrice: formData.comparePrice
          ? Number(formData.comparePrice)
          : undefined,
        category: formData.category.trim(),
        stock: Number(formData.stock),
        images: formData.images
          ? formData.images
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        tags: formData.tags
          ? formData.tags
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
      };

      if (editingProduct) {
        const updated = await productsApi.update(editingProduct.id, payload);
        setProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? updated : p)),
        );
        success("Product updated successfully");
      } else {
        const created = await productsApi.create(payload);
        setProducts((prev) => [created, ...prev]);
        success("Product created successfully");
      }
      setIsModalOpen(false);
    } catch (err) {
      error((err as Error).message || "Failed to save product");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await productsApi.delete(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      success("Product deleted");
      setConfirmDeleteId(null);
    } catch (err) {
      error((err as Error).message || "Failed to delete product");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = products.filter(
    (p) =>
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()),
  );

  const field = (key: keyof ProductFormData) => ({
    value: formData[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFormData((f) => ({ ...f, [key]: e.target.value })),
    error: formErrors[key],
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Product Management
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {products.length} products in store
          </p>
        </div>
        <Button
          onClick={openCreate}
          leftIcon={
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          }
        >
          Add Product
        </Button>
      </div>

      {/* Search */}
      <div className="mb-5 max-w-sm">
        <Input
          placeholder="Search by name or category…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          }
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <Loading message="Loading products…" />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {["Product", "Category", "Price", "Stock", "Actions"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-10 text-center text-gray-400"
                    >
                      {search
                        ? "No products match your search"
                        : "No products yet"}
                    </td>
                  </tr>
                ) : (
                  filtered.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              product.images?.[0] ||
                              product.image ||
                              `https://placehold.co/40x40/e2e8f0/64748b?text=P`
                            }
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded-lg bg-gray-100 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://placehold.co/40x40/e2e8f0/64748b?text=P";
                            }}
                          />
                          <div>
                            <p className="font-medium text-gray-900 line-clamp-1">
                              {product.name}
                            </p>
                            <p className="text-xs text-gray-400 line-clamp-1">
                              {product.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900">
                          ${product.price.toFixed(2)}
                        </p>
                        {product.comparePrice &&
                          product.comparePrice > product.price && (
                            <p className="text-xs text-gray-400 line-through">
                              ${product.comparePrice.toFixed(2)}
                            </p>
                          )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`font-medium ${product.stock === 0 ? "text-red-600" : product.stock < 10 ? "text-yellow-600" : "text-green-600"}`}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEdit(product)}
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(product.id)}
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? "Edit Product" : "Add New Product"}
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Product Name"
            placeholder="e.g. Wireless Headphones"
            required
            {...field("name")}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((f) => ({ ...f, description: e.target.value }))
              }
              rows={3}
              placeholder="Describe your product…"
              className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none ${
                formErrors.description ? "border-red-400" : "border-gray-300"
              }`}
            />
            {formErrors.description && (
              <p className="mt-1 text-xs text-red-600">
                {formErrors.description}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price ($)"
              type="number"
              placeholder="29.99"
              min="0"
              step="0.01"
              required
              {...field("price")}
            />
            <Input
              label="Compare Price ($)"
              type="number"
              placeholder="39.99"
              min="0"
              step="0.01"
              {...field("comparePrice")}
              hint="Original price for discount display"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Category"
              placeholder="Electronics"
              required
              {...field("category")}
            />
            <Input
              label="Stock Quantity"
              type="number"
              placeholder="100"
              min="0"
              required
              {...field("stock")}
            />
          </div>
          <Input
            label="Image URLs"
            placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
            hint="Comma-separated URLs"
            {...field("images")}
          />
          <Input
            label="Tags"
            placeholder="wireless, audio, premium"
            hint="Comma-separated tags"
            {...field("tags")}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSaving}>
              {editingProduct ? "Save Changes" : "Create Product"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        title="Delete Product"
        size="sm"
      >
        <p className="text-sm text-gray-600 mb-5">
          Are you sure you want to delete this product? This action cannot be
          undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            isLoading={deletingId === confirmDeleteId}
            onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
