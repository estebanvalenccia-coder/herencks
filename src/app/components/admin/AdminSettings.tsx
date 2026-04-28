# AdminSettings.tsx COMPLETO RECONSTRUIDO

```tsx
import { useState, useEffect } from "react";
import {
  Palette,
  Type,
  Moon,
  Sun,
  Eye,
  Save,
  RotateCcw,
  Bot,
  MessageSquare,
  ExternalLink,
  Home,
  House,
  Sparkles,
  Flower,
  Flower2,
  Leaf,
  LeafyGreen,
  Package,
  ShoppingBag,
  Briefcase,
  Scissors,
  Store,
  Building,
  Brain,
  Zap,
  Star,
  Truck,
} from "lucide-react";

import { toast } from "sonner";
import { supabase } from "../../lib/supabase";

interface SettingsRow {
  id?: string;
  clave: string;
  valor: any;
}

export function AdminSettings() {
  const [chatboxUrl, setChatboxUrl] = useState("");
  const [chatboxEnabled, setChatboxEnabled] = useState(false);

  const [herenciaUrl, setHerenciaUrl] = useState("");
  const [herenciaEnabled, setHerenciaEnabled] = useState(false);

  const [theme, setTheme] = useState({
    primaryColor: "#2d5f3f",
    secondaryColor: "#7fa88f",
    backgroundColor: "#fdfcfa",
    foregroundColor: "#1f2b1f",
    accentColor: "#c4dfd0",
  });

  const [menuIcons, setMenuIcons] = useState({
    home: "Home",
    products: "Leaf",
    services: "Briefcase",
    herencia: "Bot",
  });

  const [stripePublishableKey, setStripePublishableKey] = useState("");
  const [stripeEnabled, setStripeEnabled] = useState(false);

  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [supabaseAnonKey, setSupabaseAnonKey] = useState("");
  const [supabaseEnabled, setSupabaseEnabled] = useState(false);

  const [shippingCost, setShippingCost] = useState(5);

  const [aiApiKey, setAiApiKey] = useState("");
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiProvider, setAiProvider] = useState<"openai" | "groq">("groq");

  const availableIcons = [
    { name: "Home", icon: Home, label: "Casa" },
    { name: "House", icon: House, label: "Hogar" },
    { name: "Sparkles", icon: Sparkles, label: "Estrellas" },
    { name: "Flower", icon: Flower, label: "Flor" },
    { name: "Flower2", icon: Flower2, label: "Flor 2" },
    { name: "Leaf", icon: Leaf, label: "Hoja" },
    { name: "LeafyGreen", icon: LeafyGreen, label: "Hojas" },
    { name: "Package", icon: Package, label: "Paquete" },
    { name: "ShoppingBag", icon: ShoppingBag, label: "Bolsa" },
    { name: "Briefcase", icon: Briefcase, label: "Maletín" },
    { name: "Scissors", icon: Scissors, label: "Tijeras" },
    { name: "Store", icon: Store, label: "Tienda" },
    { name: "Building", icon: Building, label: "Edificio" },
    { name: "Bot", icon: Bot, label: "Robot" },
    { name: "Brain", icon: Brain, label: "Cerebro" },
    { name: "Zap", icon: Zap, label: "Rayo" },
    { name: "Star", icon: Star, label: "Estrella" },
  ];

  useEffect(() => {
    loadAllSettings();
  }, []);

  const loadSetting = async (clave: string) => {
    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .eq("clave", clave)
      .single();

    if (error || !data) {
      return null;
    }

    return data.valor;
  };

  const saveSetting = async (clave: string, valor: any) => {
    const { error } = await supabase
      .from("settings")
      .upsert({
        clave,
        valor,
      });

    if (error) {
      console.error(error);
      toast.error(`Error guardando ${clave}`);
      return false;
    }

    return true;
  };

  const loadAllSettings = async () => {
    try {
      const chatbox = await loadSetting("chatboxSettings");

      if (chatbox) {
        setChatboxUrl(chatbox.url || "");
        setChatboxEnabled(chatbox.enabled || false);
      }

      const herencia = await loadSetting("herenciaSettings");

      if (herencia) {
        setHerenciaUrl(herencia.url || "");
        setHerenciaEnabled(herencia.enabled || false);
      }

      const customTheme = await loadSetting("customTheme");

      if (customTheme) {
        setTheme(customTheme);
      }

      const icons = await loadSetting("menuIcons");

      if (icons) {
        setMenuIcons(icons);
      }

      const stripe = await loadSetting("stripeSettings");

      if (stripe) {
        setStripePublishableKey(stripe.publishableKey || "");
        setStripeEnabled(stripe.enabled || false);
      }

      const supa = await loadSetting("supabaseSettings");

      if (supa) {
        setSupabaseUrl(supa.url || "");
        setSupabaseAnonKey(supa.anonKey || "");
        setSupabaseEnabled(supa.enabled || false);
      }

      const shipping = await loadSetting("shippingSettings");

      if (shipping) {
        setShippingCost(shipping.cost || 5);
      }

      const ai = await loadSetting("aiSettings");

      if (ai) {
        setAiApiKey(ai.apiKey || "");
        setAiEnabled(ai.enabled || false);
        setAiProvider(ai.provider || "groq");
      }

      toast.success("Configuración cargada desde Supabase");
    } catch (error) {
      console.error(error);
      toast.error("Error cargando configuración");
    }
  };

  const saveChatboxSettings = async () => {
    const success = await saveSetting("chatboxSettings", {
      url: chatboxUrl,
      enabled: chatboxEnabled,
    });

    if (success) {
      toast.success("Chatbox guardado correctamente");
    }
  };

  const saveHerenciaSettings = async () => {
    const success = await saveSetting("herenciaSettings", {
      url: herenciaUrl,
      enabled: herenciaEnabled,
    });

    if (success) {
      toast.success("Herenc(IA) guardado correctamente");
    }
  };

  const saveStripeSettings = async () => {
    const success = await saveSetting("stripeSettings", {
      publishableKey: stripePublishableKey,
      enabled: stripeEnabled,
    });

    if (success) {
      toast.success("Stripe guardado correctamente");
    }
  };

  const saveSupabaseSettings = async () => {
    const success = await saveSetting("supabaseSettings", {
      url: supabaseUrl,
      anonKey: supabaseAnonKey,
      enabled: supabaseEnabled,
    });

    if (success) {
      toast.success("Supabase guardado correctamente");
    }
  };

  const saveShippingSettings = async () => {
    const success = await saveSetting("shippingSettings", {
      cost: shippingCost,
    });

    if (success) {
      toast.success("Envío guardado correctamente");
    }
  };

  const saveAiSettings = async () => {
    const success = await saveSetting("aiSettings", {
      apiKey: aiApiKey,
      enabled: aiEnabled,
      provider: aiProvider,
    });

    if (success) {
      toast.success("IA guardada correctamente");
    }
  };

  const saveThemeSettings = async () => {
    const success = await saveSetting("customTheme", theme);

    if (success) {
      toast.success("Tema guardado correctamente");
    }
  };

  const saveMenuIcons = async () => {
    const success = await saveSetting("menuIcons", menuIcons);

    if (success) {
      toast.success("Iconos guardados correctamente");
    }
  };

  const saveAll = async () => {
    await saveChatboxSettings();
    await saveHerenciaSettings();
    await saveStripeSettings();
    await saveSupabaseSettings();
    await saveShippingSettings();
    await saveAiSettings();
    await saveThemeSettings();
    await saveMenuIcons();

    toast.success("Toda la configuración fue guardada");
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Configuración General
        </h2>

        <p className="text-muted-foreground">
          Personaliza tu aplicación
        </p>
      </div>

      {/* Chatbox */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-bold text-foreground">
            Chatbox IA
          </h3>
        </div>

        <div className="space-y-4">
          <input
            type="url"
            value={chatboxUrl}
            onChange={(e) => setChatboxUrl(e.target.value)}
            placeholder="https://tu-chatbox.com"
            className="w-full px-4 py-3 bg-background border border-border rounded-xl"
          />

          <button
            onClick={() => setChatboxEnabled(!chatboxEnabled)}
            className={`w-full py-3 rounded-xl ${
              chatboxEnabled
                ? "bg-primary text-primary-foreground"
                : "bg-muted"
            }`}
          >
            {chatboxEnabled ? "Activado" : "Desactivado"}
          </button>

          <button
            onClick={saveChatboxSettings}
            className="w-full py-3 bg-primary text-primary-foreground rounded-xl"
          >
            Guardar Chatbox
          </button>
        </div>
      </div>

      {/* Save All */}
      <button
        onClick={saveAll}
        className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold"
      >
        Guardar Todo
      </button>
    </div>
  );
}

function IconSelector({
  label,
  value,
  onChange,
  icons,
}: {
  label: string;
  value: string;
  onChange: (icon: string) => void;
  icons: Array<{ name: string; icon: any; label: string }>;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const currentIcon = icons.find((i) => i.name === value);

  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-2">
        {label}
      </label>

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-3 bg-background border border-border rounded-xl"
        >
          <div className="flex items-center gap-3">
            {currentIcon && (
              <currentIcon.icon className="w-5 h-5 text-foreground" />
            )}

            <span>{currentIcon?.label}</span>
          </div>
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto">
            <div className="p-2 grid grid-cols-3 gap-2">
              {icons.map((icon) => (
                <button
                  key={icon.name}
                  type="button"
                  onClick={() => {
                    onChange(icon.name);
                    setIsOpen(false);
                  }}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-colors ${
                    value === icon.name
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent text-foreground"
                  }`}
                >
                  <icon.icon className="w-6 h-6" />
                  <span className="text-xs text-center">{icon.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ColorPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-2">
        {label}
      </label>

      <div className="flex gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-10 rounded-lg border border-border cursor-pointer"
        />

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-4 py-2 bg-background border border-border rounded-xl"
        />
      </div>
    </div>
  );
}
