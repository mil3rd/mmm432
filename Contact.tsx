import type { SiteSettings } from "@/types/database";

export default function Contact({ settings }: { settings: SiteSettings | null }) {
  const rows = [
    { label: "Phone", value: settings?.phone, href: settings?.phone ? `tel:${settings.phone}` : undefined },
    { label: "Email", value: settings?.email, href: settings?.email ? `mailto:${settings.email}` : undefined },
    {
      label: "Instagram",
      value: settings?.instagram,
      href: settings?.instagram
        ? `https://instagram.com/${settings.instagram.replace("@", "")}`
        : undefined,
    },
  ].filter((row) => row.value);

  return (
    <section className="bg-ink px-6 py-20 text-paper sm:px-10 lg:px-16">
      <h2 className="font-display text-[14vw] uppercase leading-[0.85] lg:text-[5rem]">
        Say hi.
      </h2>

      {rows.length > 0 ? (
        <div className="mt-10 flex flex-col gap-6 sm:flex-row sm:gap-16">
          {rows.map((row) => (
            <a
              key={row.label}
              href={row.href}
              target={row.label === "Instagram" ? "_blank" : undefined}
              rel={row.label === "Instagram" ? "noopener noreferrer" : undefined}
              className="group"
            >
              <p className="font-body text-xs tracking-wide text-paper/50">{row.label}</p>
              <p className="mt-1 font-display text-xl uppercase transition-colors group-hover:text-red">
                {row.value}
              </p>
            </a>
          ))}
        </div>
      ) : (
        <p className="mt-10 font-body text-sm text-paper/50">
          Add a phone, email, or Instagram handle in Admin → Settings.
        </p>
      )}
    </section>
  );
}
