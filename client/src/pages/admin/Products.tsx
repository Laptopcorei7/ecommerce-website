import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { productsApi } from "@/api";
import type { Product } from "@/types";
import { useToast } from "@/contexts/ToastContext";
import Loading from "@/components/common/Loading";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Modal from "@/components/common/Modal";
import { formatPrice } from "@/lib/format";

/** Mirrors the enum on the Product schema. */
const CATEGORIES = [
  "Electronics",
  "Clothing",
  "Books",
  "Home",
  "Sports",
  "Other",
] as const;

type Category = (typeof CATEGORIES)[number];

/**
 * The form holds strings because inputs produce strings; it is converted to
 * the API shape once, in buildPayload. The previous version carried
 * `comparePrice` and `tags` fields that don't exist on the Product schema, so
 * they were silently dropped on save.
 */
interface ProductFormData {
  name: string;
  description: string;
  price: string;
  category: Category | "";
  stock: string;
  brand: string;
  images: string;
}

const emptyForm: ProductFormData = {
  name: "",
  description: "",
  price: "",
  category: "",
  stock: "",
  brand: "",
  images: "",
};

const LOW_STOCK_THRESHOLD = 5;

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(emptyForm);
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof ProductFormData, string>>
  >({});
  const [isSaving, setIsSaving] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { success, error } = useToast();

  const fetchProducts = useCallback(
    async (q?: string) => {
      setIsLoading(true);
      try {
        // getAll, not list — `productsApi.list` never existed, so this page threw
        // on mount before it rendered anything.
        const res = await productsApi.getAll({
          search: q || undefined,
          limit: 100,
        });
        setProducts(res.products ?? []);
      } catch (err) {
        console.error("Failed to load products", err);
        setProducts([]);
        error("Could not load the catalogue.");
      } finally {
        setIsLoading(false);
      }
    },
    [error],
  );

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  function openCreate() {
    setEditingProduct(null);
    setFormData(emptyForm);
    setFormErrors({});
    setIsModalOpen(true);
  }

  function openEdit(product: Product) {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description ?? "",
      price: String(product.price),
      category: product.category,
      stock: String(product.stock),
      brand: product.brand ?? "",
      images: (product.images ?? []).join("\n"),
    });
    setFormErrors({});
    setIsModalOpen(true);
  }

  function validate(): boolean {
    const errs: Partial<Record<keyof ProductFormData, string>> = {};

    if (!formData.name.trim()) errs.name = "A name is required.";
    else if (formData.name.trim().length < 3)
      errs.name = "At least 3 characters.";

    const price = Number(formData.price);
    if (!formData.price.trim()) errs.price = "A price is required.";
    else if (!Number.isFinite(price) || price < 0)
      errs.price = "Enter a positive number.";

    const stock = Number(formData.stock);
    if (!formData.stock.trim()) errs.stock = "A stock count is required.";
    else if (!Number.isInteger(stock) || stock < 0)
      errs.stock = "Enter a whole number, zero or more.";

    if (!formData.category) errs.category = "Pick a category.";

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function buildPayload(): Partial<Product> {
    return {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: Number(formData.price),
      category: formData.category as Category,
      stock: Number(formData.stock),
      brand: formData.brand.trim(),
      images: formData.images
        .split(/[\n,]/)
        .map((url) => url.trim())
        .filter(Boolean),
    };
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    try {
      if (editingProduct) {
        await productsApi.update(editingProduct._id, buildPayload());
        success(`${formData.name.trim()} updated.`);
      } else {
        await productsApi.create(buildPayload());
        success(`${formData.name.trim()} added to the catalogue.`);
      }
      setIsModalOpen(false);
      await fetchProducts(search);
    } catch (err) {
      error((err as Error).message || "Could not save that product.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      await productsApi.delete(confirmDelete._id);
      setProducts((prev) => prev.filter((p) => p._id !== confirmDelete._id));
      success(`${confirmDelete.name} removed.`);
      setConfirmDelete(null);
    } catch (err) {
      error((err as Error).message || "Could not remove that product.");
    } finally {
      setIsDeleting(false);
    }
  }

  const field =
    (key: keyof ProductFormData) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      const { value } = e.target;
      setFormData((f) => ({ ...f, [key]: value }));
      setFormErrors((prev) =>
        prev[key] ? { ...prev, [key]: undefined } : prev,
      );
    };

  return (
    <div className="shell py-12">
      <header className="flex flex-wrap items-end justify-between gap-6 border-b border-ink-950/12 pb-6">
        <div>
          <p className="meta-accent">Administration</p>
          <h1 className="display-sm mt-3 text-ink-950">Catalogue</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/admin" className="btn-ghost btn-sm">
            Overview
          </Link>
          <Button onClick={openCreate} size="sm">
            Add product
          </Button>
        </div>
      </header>

      {/* Search */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          fetchProducts(search);
        }}
        className="flex items-center gap-3 border-b border-ink-950/12 py-3"
        role="search"
      >
        <label htmlFor="admin-search" className="sr-only">
          Search the catalogue
        </label>
        <input
          id="admin-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name"
          className="h-9 flex-1 border-0 border-b border-transparent bg-transparent px-0 font-mono text-meta uppercase text-ink-950 placeholder:text-ink-400 focus:border-ink-950 focus:outline-none focus:ring-0"
        />
        {search && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              fetchProducts();
            }}
            className="font-mono text-meta uppercase text-ink-400 hover:text-vermilion-600"
          >
            Clear
          </button>
        )}
      </form>

      {isLoading ? (
        <Loading message="Loading catalogue" />
      ) : products.length === 0 ? (
        <p className="mt-10 border border-ink-950/12 px-6 py-16 text-center text-[14px] text-ink-500">
          {search ? "Nothing matches that search." : "The catalogue is empty."}
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[46rem] border-collapse">
            <thead>
              <tr className="border-y border-ink-950/12 text-left">
                {[
                  "",
                  "Product",
                  "Category",
                  "Price",
                  "Stock",
                  "Rating",
                  "",
                ].map((heading, i) => (
                  <th
                    key={i}
                    scope="col"
                    className="py-3 pr-6 font-mono text-meta font-normal uppercase text-ink-500"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-950/12">
              {products.map((product) => {
                const soldOut = product.stock === 0;
                const low = !soldOut && product.stock <= LOW_STOCK_THRESHOLD;

                return (
                  <tr key={product._id}>
                    <td className="py-3 pr-4">
                      <div className="well h-14 w-12 border border-ink-950/12">
                        {product.images?.[0] && (
                          <img src={product.images[0]} alt="" loading="lazy" />
                        )}
                      </div>
                    </td>
                    <td className="py-3 pr-6">
                      <Link
                        to={`/products/${product._id}`}
                        className="text-[14px] font-medium tracking-tight text-ink-950 hover:text-vermilion-600"
                      >
                        {product.name}
                      </Link>
                      {product.brand && (
                        <p className="mt-0.5 text-[12px] text-ink-500">
                          {product.brand}
                        </p>
                      )}
                    </td>
                    <td className="py-3 pr-6 font-mono text-meta uppercase text-ink-600">
                      {product.category}
                    </td>
                    <td className="py-3 pr-6 font-mono text-[13px] tabular text-ink-950">
                      {formatPrice(product.price)}
                    </td>
                    <td className="py-3 pr-6">
                      <span
                        className={`font-mono text-[13px] tabular ${
                          soldOut
                            ? "text-ink-300"
                            : low
                              ? "text-vermilion-600"
                              : "text-ink-950"
                        }`}
                      >
                        {soldOut ? "Sold out" : product.stock}
                      </span>
                    </td>
                    <td className="py-3 pr-6 font-mono text-[13px] tabular text-ink-600">
                      {product.averageRating > 0
                        ? `${product.averageRating.toFixed(1)} · ${product.totalReviews}`
                        : "—"}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => openEdit(product)}
                          className="font-mono text-meta uppercase text-ink-500 underline-offset-4 transition-colors hover:text-ink-950 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(product)}
                          className="font-mono text-meta uppercase text-ink-400 underline-offset-4 transition-colors hover:text-vermilion-600 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Create / edit ─────────────────────────────────────────────────── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? "Edit product" : "Add product"}
        size="xl"
      >
        <form onSubmit={handleSave} noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input
                label="Name"
                value={formData.name}
                onChange={field("name")}
                error={formErrors.name}
                required
              />
            </div>

            <Input
              label="Brand"
              value={formData.brand}
              onChange={field("brand")}
              placeholder="Optional"
            />

            <div>
              <label htmlFor="product-category" className="label">
                Category
                <span className="ml-1 text-vermilion-600" aria-hidden>
                  *
                </span>
              </label>
              <select
                id="product-category"
                value={formData.category}
                onChange={field("category")}
                className={`field cursor-pointer ${formErrors.category ? "field-invalid" : ""}`}
                required
              >
                <option value="">Choose one</option>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {formErrors.category && (
                <p className="mt-1.5 text-xs text-vermilion-700">
                  {formErrors.category}
                </p>
              )}
            </div>

            <Input
              label="Price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={field("price")}
              error={formErrors.price}
              required
            />

            <Input
              label="Stock"
              type="number"
              step="1"
              min="0"
              value={formData.stock}
              onChange={field("stock")}
              error={formErrors.stock}
              required
            />

            <div className="sm:col-span-2">
              <label htmlFor="product-description" className="label">
                Description
              </label>
              <textarea
                id="product-description"
                value={formData.description}
                onChange={field("description")}
                rows={4}
                maxLength={1000}
                className="field h-auto resize-none py-2.5"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="product-images" className="label">
                Image URLs
              </label>
              <textarea
                id="product-images"
                value={formData.images}
                onChange={field("images")}
                rows={3}
                placeholder="One per line"
                className="field h-auto resize-none py-2.5 font-mono text-[12px]"
              />
              <p className="mt-1.5 text-xs text-ink-500">
                One per line, or comma separated. The first is used as the
                thumbnail.
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-ink-950/12 pt-5">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSaving}>
              {editingProduct ? "Save changes" : "Add product"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Delete confirmation ───────────────────────────────────────────── */}
      <Modal
        isOpen={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        title="Remove product"
        size="sm"
      >
        <p className="text-[14px] leading-relaxed text-ink-700">
          Remove{" "}
          <span className="font-medium text-ink-950">
            {confirmDelete?.name}
          </span>{" "}
          from the catalogue? Existing orders keep their record of it, but it
          will no longer be listed or purchasable.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setConfirmDelete(null)}
          >
            Keep it
          </Button>
          <Button
            type="button"
            variant="danger"
            isLoading={isDeleting}
            onClick={handleDelete}
          >
            Remove
          </Button>
        </div>
      </Modal>
    </div>
  );
}
