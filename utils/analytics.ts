// utils/analytics.ts

// Деклариране на глобалния тип за Google Analytics (window.gtag)
declare global {
  interface Window {
    gtag?: (
      command: "config" | "event" | "js",
      targetId: string,
      config?: Record<string, unknown>
    ) => void;
  }
}

/**
 * Изпраща потребителско събитие към Google Analytics 4 (GA4)
 * @param action Името на събитието (напр. "view_house_details", "submit_form")
 * @param category Категорията (напр. "Houses", "Contact_Form")
 * @param label Описание или етикет на събитието (напр. "Model_A_75sqm")
 * @param value Опционална числова стойност (напр. цена или брой)
 */
export const trackEvent = (
  action: string,
  category: string,
  label: string,
  value?: number
): void => {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      ...(value !== undefined && { value }),
    });
  } else if (process.env.NODE_ENV !== "production") {
    console.log("GA4 Event Tracked (Dev Mode):", { action, category, label, value });
  }
};

/**
 * Изпраща отчет за преглед на страница (Page View) към GA4
 * @param url Относителен или пълен URL адрес на страницата
 */
export const trackPageView = (url: string): void => {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  if (typeof window !== "undefined" && typeof window.gtag === "function" && gaId) {
    window.gtag("config", gaId, {
      page_path: url,
    });
  }
};