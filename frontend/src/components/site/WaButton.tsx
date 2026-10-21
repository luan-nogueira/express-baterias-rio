import { SiWhatsapp } from "@icons-pack/react-simple-icons";
import { cn } from "@/lib/utils";
import { waLink } from "@/lib/contact";

interface Props {
  message: string;
  children: React.ReactNode;
  testId: string;
  size?: "md" | "lg" | "sm";
  className?: string;
}

// The single WhatsApp CTA style used across the site.
export function WaButton({ message, children, testId, size = "md", className }: Props) {
  return (
    <a
      href={waLink(message)}
      target="_blank"
      rel="noopener noreferrer"
      data-testid={testId}
      className={cn(
        "group inline-flex items-center justify-center gap-2.5 rounded-md bg-wa font-semibold text-[#04260E] shadow-[0_1px_0_rgb(0_0_0/0.15)] transition-[background-color,transform,box-shadow] duration-200 hover:bg-[#2EE071] hover:shadow-[0_8px_24px_-8px_rgb(37_211_102/0.6)] active:translate-y-px",
        size === "lg" && "h-14 px-7 text-base",
        size === "md" && "h-12 px-5 text-[15px]",
        size === "sm" && "h-10 px-4 text-sm",
        className,
      )}
    >
      <SiWhatsapp size={size === "lg" ? 20 : 18} aria-hidden="true" />
      {children}
    </a>
  );
}
