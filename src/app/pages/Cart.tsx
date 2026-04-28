import { useState, useEffect } from "react";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  CreditCard,
  Banknote,
  Smartphone,
  Truck,
  Store,
  Wallet,
} from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router";
import { toast } from "sonner";
import { StripeCheckout } from "../components/StripeCheckout";
import { supabase } from "../../lib/supabase";

interface Item {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export function Cart() {
  const [items, setItems] = useState<Item[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("tarjeta");
  const [deliveryMethod, setDeliveryMethod] = useState("envio");
  const [showStripeCheckout, setShowStripeCheckout] = useState(false);
  const [stripeEnabled, setStripeEnabled] = useState(false);
  const [shippingCost, setShippingCost] = useState(5);

  useEffect(() => {
    loadCart();
    loadSettings();
  }, []);

  const loadCart = () => {
    const savedCart = localStorage.getItem("cart");

    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }
  };

  const loadSettings = async () => {
    try {
      const { data: stripeData } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "stripeSettings")
        .maybeSingle();

      if (stripeData?.value) {
        const { enabled, publishableKey } = stripeData.value;

        setStripeEnabled(enabled && publishableKey);
      }

      const { data: shippingData } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "shippingSettings")
        .maybeSingle();

      if (shippingData?.value) {
        const { cost } = shippingData.value;

        setShippingCost(cost || 5);
      }
    } catch (error) {
      console.error("Error cargando configuración:", error);
    }
  };

  const updateQuantity = (id: number, delta: number) => {
    const updated = items.map((item) => {
      if (item.id === id) {
        const newQuantity = Math.max(1, item.quantity + delta);

        return {
          ...item,
          quantity: newQuantity,
        };
      }

      return item;
    });

    setItems(updated);

    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const removeItem = (id: number) => {
    const updated = items.filter((item) => item.id !== id);

    setItems(updated);

    localStorage.setItem("cart", JSON.stringify(updated));

    toast.success("Producto eliminado del carrito");
  };

  const clearCart = () => {
    setItems([]);

    localStorage.setItem("cart", JSON.stringify([]));

    toast.success("Carrito vaciado");
  };

  const handleCheckout = async () => {
    console.log("🛒 Procesando pedido:", {
      paymentMethod,
      deliveryMethod,
      total,
      stripeEnabled,
    });

    try {
      await supabase.from("pedidos").insert([
        {
          items,
          total,
          payment_method: paymentMethod,
          delivery_method: deliveryMethod,
          status: "pending",
          created_at: new Date().toISOString(),
        },
      ]);

      console.log("✅ Pedido guardado en Supabase");
    } catch (error) {
      console.error("❌ Error guardando pedido:", error);
    }

    if (paymentMethod === "tarjeta" && stripeEnabled) {
      console.log("💳 Abriendo checkout de Stripe");

      setShowStripeCheckout(true);
    } else if (paymentMethod === "bizum") {
      console.log("📱 Método de pago: Bizum");

      const confirmed = window.confirm(
        `¿Has enviado €${total.toFixed(
          2
        )} por Bizum al número +34 631 18 92 44?\n\n` +
          `Si ya lo enviaste, presiona OK para confirmar tu pedido.\n` +
          `Si aún no lo has enviado, presiona Cancelar y envía el Bizum primero.`
      );

      if (confirmed) {
        console.log("✅ Pedido confirmado con Bizum");

        toast.success(
          "¡Pedido confirmado! Recibirás una confirmación una vez verifiquemos el pago de Bizum."
        );

        clearCart();
      } else {
        console.log("❌ Usuario canceló la confirmación de Bizum");
      }
    } else {
      console.log(`💰 Método de pago: ${paymentMethod}`);

      toast.success(
        `Pedido procesado con ${paymentMethod}. ¡Gracias por tu compra!`
      );

      clearCart();
    }
  };

  const handleStripeSuccess = () => {
    setShowStripeCheckout(false);

    clearCart();
  };

  const handleStripeCancel = () => {
    setShowStripeCheckout(false);
  };

  const subtotal = items.reduce(
    (sum, item) => sum + (item.price || 0) * item.quantity,
    0
  );

  const shipping =
    deliveryMethod === "recoger" ? 0 : shippingCost;

  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-20 h-20 mx-auto text-muted-foreground mb-4" />

          <h2 className="text-2xl font-bold text-foreground mb-2">
            Tu carrito está vacío
          </h2>

          <p className="text-muted-foreground mb-6">
            Añade productos para comenzar tu compra
          </p>

          <Link
            to="/productos"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors"
          >
            Ver productos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-muted/30 border-b border-border">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Carrito de Compras
          </h1>

          <p className="text-muted-foreground">
            {items.length}{" "}
            {items.length === 1 ? "producto" : "productos"} en tu carrito
          </p>
        </div>
      </div>

      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card border border-border rounded-2xl p-4 sm:p-6 flex gap-4"
              >
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-foreground">
                      {item.name}
                    </h3>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-lg font-bold text-primary mb-4">
                    €{(item.price || 0).toFixed(2)}
                  </p>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        updateQuantity(item.id, -1)
                      }
                      className="p-2 bg-muted hover:bg-accent rounded-lg transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <span className="w-12 text-center font-medium">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() =>
                        updateQuantity(item.id, 1)
                      }
                      className="p-2 bg-muted hover:bg-accent rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>

                    <span className="ml-auto font-semibold text-foreground">
                      €
                      {(
                        (item.price || 0) * item.quantity
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}

            <button
              onClick={clearCart}
              className="w-full py-3 text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
            >
              Vaciar carrito
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeliveryOption({
  icon: Icon,
  label,
  sublabel,
  selected,
  onSelect,
}: any) {
  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
        selected
          ? "border-primary bg-primary/5"
          : "border-border hover:bg-accent"
      }`}
    >
      <Icon
        className={`w-5 h-5 ${
          selected
            ? "text-primary"
            : "text-muted-foreground"
        }`}
      />

      <div className="flex-1 text-left">
        <span
          className={`font-medium block ${
            selected
              ? "text-primary"
              : "text-foreground"
          }`}
        >
          {label}
        </span>

        <span className="text-xs text-muted-foreground">
          {sublabel}
        </span>
      </div>
    </button>
  );
}

function PaymentOption({
  icon: Icon,
  label,
  sublabel,
  selected,
  onSelect,
}: any) {
  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
        selected
          ? "border-primary bg-primary/5"
          : "border-border hover:bg-accent"
      }`}
    >
      <Icon
        className={`w-5 h-5 ${
          selected
            ? "text-primary"
            : "text-muted-foreground"
        }`}
      />

      <div className="flex-1 text-left">
        <span
          className={`font-medium block ${
            selected
              ? "text-primary"
              : "text-foreground"
          }`}
        >
          {label}
        </span>

        {sublabel && (
          <span className="text-xs text-muted-foreground font-mono">
            {sublabel}
          </span>
        )}
      </div>
    </button>
  );
}
