import { useState, useEffect } from "react";
import { MessageSquare, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "../../lib/supabase";

export function ChatboxWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [chatboxUrl, setChatboxUrl] = useState("");
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const { data, error } = await supabase
        .from("settings")
        .select("valor")
        .eq("clave", "chatboxSettings")
        .maybeSingle(); // 🔥 mejor que single()

      if (error) {
        console.error(error);
        return;
      }

      if (data?.valor) {
        setChatboxUrl(data.valor.url || "");
        setIsEnabled(data.valor.enabled || false);
      }
    };

    loadSettings();

    // 🔥 realtime (opcional pero pro)
    const channel = supabase
      .channel("settings-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "settings"
        },
        () => {
          loadSettings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (!isEnabled || !chatboxUrl) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center"
          >
            <MessageSquare className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[90vw] sm:w-96 h-[600px] max-h-[80vh] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                <h3 className="font-semibold">Asistente IA</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-primary-foreground/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden">
              <iframe
                src={chatboxUrl}
                className="w-full h-full border-0"
                title="Chatbox IA"
                allow="microphone; camera"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}