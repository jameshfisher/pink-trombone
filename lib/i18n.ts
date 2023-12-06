const en = {
  NASAL_CAVITY: "nasal cavity",
  SOFT_PALATE_1: "soft",
  SOFT_PALATE_2: "palate",
  HARD_PALATE_1: "hard",
  HARD_PALATE_2: "palate",
  ORAL_CAVITY: "oral cavity",
  LIP: "lip",
  THROAT: "throat",
  TONGUE_CONTROL: "tongue control",
  VOICEBOX_CONTROL: "voicebox control",
  PITCH: "pitch",
  NASALS: "nasals",
  STOPS: "stops",
  FRICATIVES: "fricatives",
} as const;

const de = {
  NASAL_CAVITY: "Nasenhöhle",
  SOFT_PALATE_1: "Weicher",
  SOFT_PALATE_2: "Gaumen",
  HARD_PALATE_1: "Harter",
  HARD_PALATE_2: "Gaumen",
  ORAL_CAVITY: "Mundhöhle",
  LIP: "Lippe",
  THROAT: "Kehle",
  TONGUE_CONTROL: "Steuerung der Zunge",
  VOICEBOX_CONTROL: "Steuerung des Kehlkopfs",
  PITCH: "Tonhöhe",
  NASALS: "Nasale",
  STOPS: "Verschlusslaute",
  FRICATIVES: "Reibelaute",
} as const;

type TRANSLATION_KEY = keyof typeof en;

let lang = "en";

export const i18n = {
  t: (text: TRANSLATION_KEY) => {
    if (lang === "en") {
      return en[text];
    } else {
      return de[text];
    }
  },
  getLang: () => lang,
  init: async (args: {
    queryStringVariable: string;
    translationsDirectory: string;
    defaultLanguage: string;
  }) => {
    lang = args.defaultLanguage;
  },
};
