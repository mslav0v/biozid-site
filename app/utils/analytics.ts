// utils/analytics.ts

// Декларираме типа на window.gtag, за да не се оплаква TypeScript
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

/**
 * Изпраща събитие към Google Analytics (GA4)
 * @param action - Името на събитието (напр. "view_house_details")
 * @param category - Категорията (напр. "Houses")
 * @param label - Допълнително описание (напр. "Model_A_75sqm")
 * @param value - Стойност (опционално, напр. цена)
 */
export const trackEvent = (
  action: string,
  category: string,
  label: string,
  value?: number
) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  } else {
    // Ако сме в режим на разработка (development) и няма GA, просто принтираме в конзолата
    if (process.env.NODE_ENV !== "production") {
      console.log("GA Event Tracked:", { action, category, label, value });
    }
  }
};