import { SiWhatsapp } from "@icons-pack/react-simple-icons";
import { WA_MESSAGES, waLink } from "@/lib/contact";

// Small, fixed bottom-right; leaves the bottom-left free and content padding keeps it off the footer text.
export function WhatsAppFloat() {
  return (
    <a
      href={waLink(WA_MESSAGES.general)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Conversar no WhatsApp"
      data-testid="floating-whatsapp-button"
      className="fixed bottom-5 right-5 z-30 inline-flex size-14 items-center justify-center rounded-full bg-wa text-[#04260E] shadow-[0_10px_30px_-10px_rgb(0_0_0/0.45)] ring-4 ring-white/70 transition-[transform,background-color] duration-200 hover:scale-105 hover:bg-[#2EE071] sm:bottom-6 sm:right-6"
    >
      <SiWhatsapp size={26} aria-hidden="true" />
    </a>
  );
}
