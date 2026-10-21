import { DAYS, hasAddress, useStoreInfo } from "@/lib/store";
import { INSTAGRAM_URL, MAPS_URL, NEIGHBORHOODS } from "@/lib/contact";

const SITE = "https://expressbateriasrio.com.br";

// Schema.org LocalBusiness. Address and opening hours appear only once they are filled in /admin.
export function StoreJsonLd() {
  const { data } = useStoreInfo();
  const ld: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "AutoPartsStore",
    name: "Express Baterias Rio",
    url: `${SITE}/`,
    logo: `${SITE}/logo-express.png`,
    image: `${SITE}/img/2.webp`,
    telephone: "+55-21-99940-4005",
    hasMap: MAPS_URL,
    sameAs: [INSTAGRAM_URL],
    areaServed: ["Zona Sul do Rio de Janeiro", "Centro do Rio de Janeiro", ...NEIGHBORHOODS],
    paymentAccepted: "Parcelamento em até 10x sem juros",
    address: {
      "@type": "PostalAddress",
      addressLocality: data?.city || "Rio de Janeiro",
      addressRegion: data?.state || "RJ",
      addressCountry: "BR",
      ...(data && hasAddress(data)
        ? { streetAddress: data.street_address, postalCode: data.postal_code || undefined }
        : {}),
    },
  };
  if (data && data.hours.length) {
    ld.openingHoursSpecification = data.hours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.days.map((c) => DAYS.find((d) => d.code === c)?.schema),
      opens: h.opens,
      closes: h.closes === "24:00" ? "23:59" : h.closes,
    }));
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />;
}
