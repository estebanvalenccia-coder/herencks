import { useState, useEffect } from "react";
import { loadStripe, Stripe, StripeElements, StripeCardElement } from "@stripe/stripe-js";
import { CreditCard, Lock, AlertCircle, Wallet } from "lucide-react";
import { toast } from "sonner";

interface StripeCheckoutProps {
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export function StripeCheckout({ amount, onSuccess, onCancel }: StripeCheckoutProps) {
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [elements, setElements] = useState<StripeElements | null>(null);
  const [cardElement, setCardElement] = useState<StripeCardElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [cardholderName, setCardholderName] = useState("");
  const [email, setEmail] = useState("");
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const initStripe = async () => {
      const settings = localStorage.getItem("stripeSettings");
      if (settings) {
        const { publishableKey, enabled } = JSON.parse(settings);
        if (enabled && publishableKey) {
          const stripeInstance = await loadStripe(publishableKey);
          setStripe(stripeInstance);

          if (stripeInstance) {
            const elementsInstance = stripeInstance.elements();
            setElements(elementsInstance);

            const cardElementInstance = elementsInstance.create("card", {
              style: {
                base: {
                  fontSize: "16px",
                  color: "#1f2b1f",
                  "::placeholder": {
                    color: "#7fa88f",
                  },
                },
                invalid: {
                  color: "#e63946",
                },
              },
            });

            setCardElement(cardElementInstance);

            setTimeout(() => {
              const container = document.getElementById("card-element");
              if (container && cardElementInstance) {
                cardElementInstance.mount("#card-element");
              }
            }, 100);
          }
        }
      }
    };
    initStripe();

    return () => {
      if (cardElement) {
        cardElement.unmount();
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !cardElement) {
      toast.error("Stripe no está configurado correctamente");
      return;
    }

    if (!cardholderName || !email) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    setLoading(true);

    try {
      toast.info("Procesando pago con Stripe...", { duration: 2000 });

      // Obtener configuración de Supabase
      const supabaseSettings = localStorage.getItem("supabaseSettings");

      if (supabaseSettings) {
        const { url, enabled } = JSON.parse(supabaseSettings);

        if (enabled && url) {
          // FLUJO REAL CON SUPABASE EDGE FUNCTION
          const edgeFunctionUrl = `${url}/functions/v1/create-payment-intent`;

          // Obtener items del carrito
          const cart = JSON.parse(localStorage.getItem("cart") || "[]");

          console.log("Llamando a Edge Function:", edgeFunctionUrl);
          console.log("Datos:", { amount, email, items: cart });

          // Llamar a la Edge Function
          let response;
          try {
            response = await fetch(edgeFunctionUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
              amount: Math.round(amount * 100),
             email: email,
             items: cart,
              }),
              
              }),
            });
          } catch (fetchError: any) {
            console.error("Error de conexión:", fetchError);
            throw new Error(
              "No se pudo conectar con el servidor de pagos. Verifica que:\n\n" +
              "1. La Edge Function 'create-payment-intent' esté desplegada en Supabase\n" +
              "2. La URL de Supabase sea correcta\n" +
              "3. Los headers CORS estén configurados\n\n" +
              "O usa otro método de pago como Bizum."
            );
          }

          console.log("Response status:", response.status);

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("Error response:", errorData);
            throw new Error(
              errorData.error ||
              `Error ${response.status}: No se pudo procesar el pago. Intenta con Bizum o contacta al administrador.`
            );
          }

          const { clientSecret } = await response.json();
          console.log("Client secret obtenido");

          // Confirmar el pago con Stripe usando el cardElement
          const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
            clientSecret,
            {
              payment_method: {
                card: cardElement,
                billing_details: {
                  name: cardholderName,
                  email: email,
                },
              },
            }
          );

          if (stripeError) {
            console.error("Stripe error:", stripeError);
            throw new Error(stripeError.message);
          }

          if (paymentIntent?.status === "succeeded") {
            toast.success("¡Pago procesado exitosamente!");
            localStorage.removeItem("cart");
            onSuccess();
          }

        } else {
          // MODO SIMULACIÓN (Sin Supabase)
          await new Promise(resolve => setTimeout(resolve, 2000));
          toast.success("¡Pago simulado exitosamente! Conecta Supabase para pagos reales.");
          onSuccess();
        }
      } else {
        // MODO SIMULACIÓN (Sin Supabase)
        await new Promise(resolve => setTimeout(resolve, 2000));
        toast.success("¡Pago simulado exitosamente! Conecta Supabase para pagos reales.");
        onSuccess();
      }

    } catch (error: any) {
      const errorMsg = error.message || "Error al procesar el pago";
      setErrorMessage(errorMsg);
      setShowError(true);
      toast.error("Error al procesar el pago con tarjeta");
      console.error("Error completo:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!stripe) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Cargando pasarela de pago...</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="bg-primary/10 p-2 rounded-lg">
          <CreditCard className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Pago con Tarjeta</h3>
          <p className="text-sm text-muted-foreground">Procesado de forma segura con Stripe</p>
        </div>
      </div>

      {showError && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
          <div className="flex items-start gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive mb-1">
                Error al procesar el pago con tarjeta
              </p>
              <p className="text-xs text-muted-foreground whitespace-pre-line">
                {errorMessage}
              </p>
            </div>
          </div>
          <div className="pt-3 border-t border-destructive/20">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4 text-primary" />
              <p className="text-sm font-medium text-foreground">Prueba con Bizum</p>
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              Envía €{amount.toFixed(2)} por Bizum a:
            </p>
            <p className="text-sm font-mono font-bold text-primary">+34 631 18 92 44</p>
            <button
              type="button"
              onClick={onCancel}
              className="mt-3 w-full py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
            >
              Volver y elegir Bizum
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
            className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Nombre en la Tarjeta
          </label>
          <input
            type="text"
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
            placeholder="Juan Pérez"
            required
            className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Información de Tarjeta
          </label>
          <div
            id="card-element"
            className="w-full px-4 py-3 bg-background border border-border rounded-xl"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Para pruebas: 4242 4242 4242 4242, cualquier fecha futura y CVC
          </p>
        </div>

        <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
          <div className="flex items-start gap-2">
            <Lock className="w-4 h-4 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Pago Seguro con Stripe
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {localStorage.getItem("supabaseSettings") && JSON.parse(localStorage.getItem("supabaseSettings") || "{}").enabled
                  ? "✅ Conectado a Supabase. Los pagos se procesarán de forma real y segura."
                  : "⚠️ Modo simulación. Conecta Supabase en Admin → Configuración para procesar pagos reales."}
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between mb-4">
            <span className="text-foreground font-medium">Total a pagar:</span>
            <span className="text-2xl font-bold text-primary">€{amount.toFixed(2)}</span>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Procesando..." : `Pagar €${amount.toFixed(2)}`}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-6 py-3 bg-muted text-foreground rounded-xl hover:bg-accent transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Al confirmar, aceptas los <a href="/terminos" className="text-primary hover:underline">términos y condiciones</a>
          </p>
        </div>
      </form>
    </div>
  );
}
