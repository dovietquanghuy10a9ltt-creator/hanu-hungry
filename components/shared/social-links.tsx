export const SOCIAL_LINKS = [
  {
    name: "Facebook",
    label: "Fanpage Hanu Hungry",
    href: "https://www.facebook.com/share/1FERU86RZf/?mibextid=wwXIfr",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    name: "Threads",
    label: "@hanuhungry.mcr trên Threads",
    href: "https://www.threads.com/@hanuhungry.mcr",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12.186 24C5.452 24 0 18.675 0 12.088 0 5.498 5.452 0 12.186 0c6.685 0 12.138 5.426 12.138 12.088 0 .684-.06 1.365-.177 2.034-.143.82-1.002 1.32-1.823 1.176-.82-.143-1.32-.897-1.177-1.716.096-.547.145-1.01.145-1.494 0-5.334-4.275-9.67-9.256-9.67-4.982 0-9.257 4.336-9.257 9.67 0 5.335 4.275 9.671 9.257 9.671 3.208 0 6.094-1.636 7.74-4.225.438-.69 1.353-.902 2.044-.464.69.438.902 1.353.464 2.044-2.128 3.35-5.88 5.47-10.046 5.47zm3.882-9.646c0-2.67-1.87-4.52-4.553-4.52-2.784 0-4.664 1.942-4.664 4.809 0 2.802 1.815 4.793 4.542 4.793 1.87 0 3.275-.828 4.062-2.392.355-.705 1.215-.98 1.92-.625.705.355.98 1.215.625 1.92-1.196 2.378-3.4 3.666-6.607 3.666-4.248 0-7.227-3.08-7.227-7.362 0-4.385 3.037-7.378 7.349-7.378 4.202 0 7.234 2.915 7.234 7.089 0 3.518-2.27 6.13-5.59 6.13-1.467 0-2.8-.62-3.668-1.705.517-.373 1.077-.73 1.67-.73.498 0 .976.12 1.393.35.39.215.823.332 1.267.332 1.867 0 3.19-1.572 3.19-3.687z" />
      </svg>
    ),
  },
  {
    name: "TikTok",
    label: "@hanuhungry.mcr trên TikTok",
    href: "https://www.tiktok.com/@hanuhungry.mcr?is_from_webapp=1&sender_device=pc",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.89 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.52a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.67 6.34 6.34 0 0 0 9.49 22a6.34 6.34 0 0 0 6.34-6.33V9.52a8.16 8.16 0 0 0 4.76 1.54v-3.52c-.35 0-.69-.28-1-.85z" />
      </svg>
    ),
  },
];

export const CONTACT_INFO = {
  phone: "039 562 2006",
  phoneHref: "tel:0395622006",
  email: "hanuhungry.mcr@gmail.com",
  emailHref: "mailto:hanuhungry.mcr@gmail.com",
};

export function SocialIconsRow({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {SOCIAL_LINKS.map((link) => (
        <a
          key={link.name}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          title={link.label}
          aria-label={link.label}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-line)] bg-white text-[var(--color-ink)] transition-all hover:-translate-y-0.5 hover:border-[var(--color-red)] hover:bg-[var(--color-pale)] hover:text-[var(--color-red)] hover:shadow-xs active:translate-y-0"
        >
          {link.icon}
        </a>
      ))}
    </div>
  );
}

export function ContactDirectDetails({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-x-5 gap-y-2 text-sm ${className}`}>
      <a
        href={CONTACT_INFO.phoneHref}
        className="inline-flex items-center gap-1.5 font-bold text-[var(--color-red)] transition hover:underline"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
        <span>{CONTACT_INFO.phone}</span>
      </a>
      <a
        href={CONTACT_INFO.emailHref}
        className="inline-flex items-center gap-1.5 font-bold text-[var(--color-red)] transition hover:underline"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect width="20" height="16" x="2" y="4" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
        <span>{CONTACT_INFO.email}</span>
      </a>
    </div>
  );
}
