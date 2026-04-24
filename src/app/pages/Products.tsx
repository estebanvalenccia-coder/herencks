import { useState, useEffect } from "react";
import { Search, ShoppingCart, Heart, Filter } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { useLocation, Link } from "react-router";
import { supabase } from "../lib/supabase";

export function Products() {
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [displayProducts, setDisplayProducts] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  // Categorías (puedes luego moverlas a BD)
  const categories = [
    { id: "todos", name: "Todos" },
    { id: "ramos", name: "Ramos" },
    { id: "plantas", name: "Plantas" },
    { id: "regalos", name: "Regalos" }
  ];

  // Obtener usuario actual
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();
  }, []);

  // Leer categoría de URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoria = params.get("categoria");
    if (categoria) {
      setSelectedCategory(categoria);
    }
  }, [location.search]);

  // 🔥 Cargar productos desde Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("productos")
        .select("*");

      if (error) {
        console.error(error);
        toast.error("Error cargando productos");
      } else {
        setDisplayProducts(data || []);
      }
    };

    fetchProducts();
  }, []);

  // 🔥 Añadir al carrito (Supabase)
  const addToCart = async (product: any) => {
    if (!user) {
      toast.error("Debes iniciar sesión");
      return;
    }

    try {
      // Ver si ya existe en carrito
      const { data: existing } = await supabase
        .from("carrito")
        .select("*")
        .eq("user_id", user.id)
        .eq("producto_id", product.id)
        .single();

      if (existing) {
        // actualizar cantidad
        await supabase
          .from("carrito")
          .update({ cantidad: existing.cantidad + 1 })
          .eq("id", existing.id);
      } else {
        // insertar nuevo
        await supabase
          .from("carrito")
          .insert([
            {
              user_id: user.id,
              producto_id: product.id,
              cantidad: 1
            }
          ]);
      }

      toast.success("Producto añadido al carrito");
    } catch (err) {
      console.error(err);
      toast.error("Error añadiendo al carrito");
    }
  };

  const filteredProducts = displayProducts.filter((product) => {
    const matchesCategory =
      selectedCategory === "todos" || product.categoria === selectedCategory;

    const matchesSearch =
      product.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.descripcion?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-muted/30 border-b border-border">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Nuestros Productos
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Explora nuestra selección de flores, plantas y accesorios
          </p>
        </div>
      </div>

      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8">
        {/* Search */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border rounded-xl"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="sm:hidden px-6 py-3 border rounded-xl"
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>

          {/* Categorías */}
          <div className={`${showFilters ? "block" : "hidden"} sm:block`}>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg ${
                    selectedCategory === category.id
                      ? "bg-primary text-white"
                      : "border"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Productos */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p>No se encontraron productos</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border rounded-2xl overflow-hidden"
              >
                <Link to={`/producto/${product.id}`}>
                  <img
                    src={product.imagen}
                    alt={product.nombre}
                    className="w-full h-64 object-cover"
                  />
                </Link>

                <div className="p-5">
                  <h3>{product.nombre}</h3>
                  <p>{product.descripcion}</p>

                  <div className="flex justify-between items-center">
                    <span>€{product.precio}</span>

                    <button
                      onClick={() => addToCart(product)}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Añadir
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
