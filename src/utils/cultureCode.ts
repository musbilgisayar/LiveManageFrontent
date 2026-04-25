// src/app/utils/cultureCode.ts
export function getCultureCode(): string {
  let lang = navigator.language || "en-US";

  // Eğer sadece 2 harf geldiyse → normalize et
  if (/^[a-z]{2}$/i.test(lang)) {
    switch (lang.toLowerCase()) {
      case "tr": return "tr-TR";
      case "en": return "en-US";
      case "de": return "de-DE";
      case "fr": return "fr-FR";
      case "it": return "it-IT";
      case "ar": return "ar-SA"; // Arapça için Suudi Arabistan default
      default:
        return lang.toLowerCase() + "-" + lang.toUpperCase();
    }
  }

  return lang;
}
