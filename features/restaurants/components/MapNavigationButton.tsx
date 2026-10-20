"use client";

import { STORAGE_KEYS, CUSTOM_EVENTS } from "@/lib/constants";

type Props = {
  mapLink: string;
  restaurantId: string;
  restaurantName: string;
  className?: string;
};

export function MapNavigationButton({
  mapLink,
  restaurantId,
  restaurantName,
  className = "button button-primary w-full sm:w-auto",
}: Props) {
  const handleClick = () => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.PENDING_CHECKIN,
        JSON.stringify({
          restaurantId,
          restaurantName,
          timestamp: Date.now(),
        })
      );
      // Dispatch storage event for same-tab listeners
      window.dispatchEvent(new Event(CUSTOM_EVENTS.PENDING_CHECKIN_UPDATED));
    } catch {
      // Ignore localStorage exceptions in restrictive environments
    }
  };

  return (
    <a
      href={mapLink}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={className}
    >
      Mở trên Google Maps ↗
    </a>
  );
}

