import { Mail } from "lucide-react";

export const SOCIAL_LINKS = [
  {
    name: "Facebook",
    label: "Fanpage Hanu Hungry",
    href: "https://www.facebook.com/share/1FERU86RZf/?mibextid=wwXIfr",
    bgClass: "bg-[#1877F2] text-white hover:bg-[#166fe5]",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    name: "TikTok",
    label: "@hanuhungry.mcr trên TikTok",
    href: "https://www.tiktok.com/@hanuhungry.mcr?is_from_webapp=1&sender_device=pc",
    bgClass: "bg-black text-white hover:bg-neutral-900",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-.88-.06A6.34 6.34 0 0 0 3.14 15.7 6.34 6.34 0 0 0 9.48 22a6.34 6.34 0 0 0 6.34-6.33V9.22a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.65z" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    label: "@hanuhungry.mcr trên Instagram",
    href: "https://www.instagram.com/hanuhungry.mcr",
    bgClass: "bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white hover:opacity-90",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
  {
    name: "Threads",
    label: "@hanuhungry.mcr trên Threads",
    href: "https://www.threads.com/@hanuhungry.mcr",
    bgClass: "bg-black text-white hover:bg-neutral-900",
    icon: (
      <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.263 11.097c-.03-3.486-1.92-5.586-5.111-5.586-2.13 0-3.922.963-4.863 2.499l2.062 1.438c.535-.843 1.272-1.543 2.628-1.543 1.528 0 2.318.85 2.544 2.431a15 15 0 0 0-2.236-.173c-4.125 0-6.068 1.867-6.068 4.336s1.943 3.99 4.804 3.99c3.139 0 5.013-2.115 5.781-4.735.798.361 1.348 1.204 1.348 2.47 0 3.387-3.907 5.232-7.22 5.232-4.885 0-8.077-3.207-8.077-8.424 0-6.392 4.223-10.487 9.9-10.487 3.808 0 5.69 1.671 6.97 3.914l2.108-1.475C21.44 2.078 18.331 0 13.663 0 6.227 0 1.168 5.277 1.168 12.934c0 7 4.953 11.066 10.856 11.066 4.878 0 9.809-2.846 9.809-7.716 0-2.545-1.46-4.231-3.569-5.187m-6.33 4.855c-1.077 0-2.026-.512-2.026-1.453 0-1.483 1.822-1.934 3.606-1.934.678 0 1.34.045 1.927.173-.422 1.927-1.671 3.215-3.508 3.214Z" />
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
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-line)] bg-white text-[var(--color-ink)] transition-all hover:-translate-y-0.5 hover:border-[var(--color-red)] hover:bg-[var(--color-pale)] hover:text-[var(--color-red)] hover:shadow-xs active:translate-y-0"
        >
          {link.icon}
        </a>
      ))}
    </div>
  );
}

/**
 * Circular colored buttons matching reference screenshot
 */
export function FooterSocialButtons({ className = "" }: { className?: string }) {
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
          className={`inline-flex h-9 w-9 items-center justify-center rounded-full shadow-md transition-all hover:scale-110 active:scale-95 ${link.bgClass}`}
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
        <Mail className="h-4.5 w-4.5 shrink-0" />
        <span>{CONTACT_INFO.email}</span>
      </a>
    </div>
  );
}
