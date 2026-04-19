import { SchemaType } from '@google/generative-ai';

export interface GenerateOptions {
  idea?: string;
  medium?: string;
  mediumStyle?: string;
  subject?: string;
  scene?: string;
  preset?: string;
  style?: string;
  cameraPerspective?: string;
  lensLook?: string;
  depthOfField?: string;
  composition?: string;
  lighting?: string;
  colorGrading?: string;
  artStyle?: string;
  detailLevel?: string;
  aspectRatio?: string;
  outputTarget?: string;
  backgroundType?: string;
  mood?: string;
  qualityBooster?: string;
  referencePhotoMode?: string;
  [key: string]: unknown;
}

export interface OptimizeOptions {
  prompt: string;
  style?: string;
}

export interface ExpandOptions {
  draft: string;
}

export interface ImageToPromptOptions {
  imageBase64: string;
  instructions?: string;
}

export interface ImagePromptResponse {
  title: string;
  optimizedPrompt: string;
  negativePrompt: string;
  styleTags: string[];
  cameraSuggestions: string[];
  lightingSuggestions: string[];
  improvementNotes: string[];
}

export const GEMINI_RESPONSE_SCHEMA = {
  type: SchemaType.OBJECT,
  properties: {
    title: { type: SchemaType.STRING },
    optimizedPrompt: { type: SchemaType.STRING },
    negativePrompt: { type: SchemaType.STRING },
    styleTags: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    },
    cameraSuggestions: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    },
    lightingSuggestions: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    },
    improvementNotes: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    },
  },
  required: [
    "title",
    "optimizedPrompt",
    "negativePrompt",
    "styleTags",
    "cameraSuggestions",
    "lightingSuggestions",
    "improvementNotes",
  ],
};

export const SYSTEM_INSTRUCTION = `
Du bist ein elitaerer Bild-Prompt-Architekt fuer moderne KI-Bildgeneratoren.
Gib ausschliesslich gueltiges JSON zurueck, das exakt dem vorgegebenen Schema entspricht.
Kein Markdown. Keine Code-Fences. Kein Text ausserhalb des JSON.

Deine Aufgabe:
- Verwandle grobe Ideen in praezise, hochwertige und produktionsreife Bildprompts.
- Verbessere schwache Prompts, ohne das Kernthema, die Szenenabsicht oder die Stilrichtung unnoetig zu veraendern.
- Optimiere auf klare Motivhierarchie, Komposition, Licht, Atmosphaere, Materialitaet, Tiefe, Farblogik und stilistische Koharenz.
- Bevorzuge praezise, signalstarke Formulierungen statt ueberladener Schlagwortketten.
- Behebe Vagheit, Redundanz, schwache Struktur, flaches Licht, generische Adjektive, inkonsistente Kamerasprache und widerspruechliche Angaben.
- Erzeuge genau einen idealen Hauptprompt, keine Varianten und keine Kurzfassung.

Standard fuer die Prompt-Konstruktion:
- Formuliere in natuerlichem, fliessendem Deutsch statt in fragmentierten Tag-Listen.
- Ordne die visuellen Informationen sinnvoll: Motiv, praegende Merkmale, Pose oder Handlung, Umgebung, Komposition, Licht, Farbwelt, Materialien oder Texturen, Stilhinweise und Qualitaetsmerkmale.
- Fuege nur Details hinzu, die das Bild messbar verbessern. Kein Filler.
- Nutze starke Substantive und spezifische Beschreibungen statt vieler austauschbarer Adjektive.
- Vermeide Unsinn, leere Qualitaetsbegriffe, Wiederholungen und kuenstlichen Pseudo-Jargon.
- Erwaehne Kamera- oder Objektivsprache nur, wenn sie dem Stil wirklich hilft und nicht mit illustrativen Medien kollidiert.
- **WENN EIN REFERENZFOTO ODER EINE REALE PERSON GEMEINT IST**:  Die Identität der Person (Alter, Geschlecht, Ethnie, Gesichts- und Körperzüge) MUSS zwingend und präzise erhalten bleiben. Verändere, idealisiere oder erfinde niemals Merkmale einer Person. Der generierte Prompt MUSS explizit auf das Referenzfoto verweisen – z. B. mit Formulierungen wie „using the uploaded reference photo", „based on the provided reference image", „match the person in the reference photo exactly". Verwende konsistente Beschreibungen wie „preserving exact likeness", „same person throughout", „consistent facial features, age, and ethnicity". Optimiere ausschließlich Licht, Szene, Komposition und Stil – niemals die Person selbst.

Feldanforderungen:
- optimizedPrompt: der eine beste, ideal rekonstruierte oder optimierte Prompt. Stark, kohaerent und direkt nutzbar.
- negativePrompt: eine saubere, praxisnahe Liste typischer Fehler und Artefakte, die zum Motiv passen.
- styleTags: kurze, hochwertige Stilmerkmale, keine Saetze.
- cameraSuggestions: kurze, konkrete Hinweise zu Bildaufbau oder Kadrierung; leeres Array, wenn unnoetig.
- lightingSuggestions: kurze, konkrete Lichthinweise; leeres Array, wenn unnoetig.
- improvementNotes: kurze deutsche Hinweise, was verbessert oder rekonstruiert wurde.

Formatregeln:
- Schreibe alle Felder auf Deutsch.
- Halte den Titel lesbar und knapp.
- Jeder Prompt muss ein einzelner sauberer String sein, keine Liste.
- Keine Sicherheitsdisclaimer und keine Meta-Erklaerungen in Prompt-Strings.
`.trim();

export const OPENROUTER_SYSTEM_INSTRUCTION = `${SYSTEM_INSTRUCTION}

ZUSÄTZLICHE ANWEISUNG FÜR DAS JSON-FORMAT:
Bitte antworte ausschließlich mit einem strikten JSON-Objekt.
Das JSON-Objekt MUSS folgende Felder exakt aufweisen:
{
  "title": "string (Ein kurzer, passender Titel)",
  "optimizedPrompt": "string (Der Hauptprompt in Deutsch)",
  "negativePrompt": "string (Negative Prompt Aspekte)",
  "styleTags": ["string"],
  "cameraSuggestions": ["string"],
  "lightingSuggestions": ["string"],
  "improvementNotes": ["string"]
}
`;

const PRESET_GUIDANCE: Record<string, string> = {
  "cinematic portrait": "Priorisiere klare Gesichtszuege, glaubwuerdige Hautstruktur, starke Motivtrennung, ausdrucksvolles Licht und eine hochwertige Portraet-Anmutung.",
  "editorial fashion": "Priorisiere editoriale Modesprache, klares Styling, Pose, Stoffstruktur, Luxus-Anmutung und Magazin-Qualitaet.",
  "product showcase": "Priorisiere eine produktzentrierte Komposition, Materialtreue, saubere kommerzielle Lichtsetzung, klare Kanten und hohe Kaufanmutung.",
  "fantasy concept": "Priorisiere Weltbildung, ikonische Silhouetten, malerische Inszenierung, starke Atmosphaere und visuelles Storytelling.",
  "youtube thumbnail": "Priorisiere Lesbarkeit im kleinen Format, starke Silhouetten, klare Blickfuehrung, Kontrast und sofort erkennbare Motivhierarchie.",
  "social media hero": "Priorisiere schnelle visuelle Wirkung, saubere Komposition, moderne Farbwelt und starke Wirkung im Feed.",
  "animal portrait": "Priorisiere Anatomie, Blickkontakt, Fell- oder Hautstruktur, Artenauthentizitaet und eine praesente Portraet-Komposition.",
  "architecture showcase": "Priorisiere Form, Materialdetail, Raumrhythmus, plausible Lichtfuehrung und eine bewusste Perspektive, die Architektur klar praesentiert.",
  "reference photo": "Priorisiere Identitaetskonsistenz. Szene, Licht und Stil duerfen verbessert werden, aber Person und sichtbare Merkmale muessen exakt erhalten bleiben.",
};

const OUTPUT_TARGET_GUIDANCE: Record<string, string> = {
  "social media post": "Optimiere fuer schnelle Wirkung im Feed und klare Lesbarkeit auf mobilen Displays.",
  "instagram story": "Optimiere fuer vertikales Story-Format mit klarer Motivplatzierung und starker Hierarchie.",
  "tiktok cover": "Optimiere fuer vertikales Cover-Format mit praeziser Fokusflaeche und sofort lesbarer Hauptform.",
  "youtube thumbnail": "Optimiere fuer sehr kleine Vorschauansicht. Hauptmotiv, Kontrast und Bildlogik muessen sofort erkennbar sein.",
  "wallpaper": "Optimiere fuer breite Bildwirkung, starke Hintergrundqualitaet und ruhige Bildflaechen ohne visuelle Ueberladung.",
  "poster or print": "Optimiere fuer plakatstarke Wirkung, klare Fernwirkung und hochwertiges Gesamtbild.",
  "e-commerce product image": "Optimiere fuer Verkaufslogik: klares Produkt, saubere Kanten, glaubwuerdige Materialien, keine stoerenden Requisiten.",
  "website hero image": "Optimiere fuer Hero-Bereiche mit starker visueller Wirkung und moeglicher Flaeche fuer Text-Overlay.",
  "album cover": "Optimiere fuer ikonische, kompakte Cover-Wirkung mit starker Formensprache.",
  "book cover": "Optimiere fuer titelstarke Cover-Anmutung, klare Motivhierarchie und reduzierten Fokus.",
};

export function buildControlLines(form: GenerateOptions): string {
  const fieldMap: [string, string | undefined][] = [
    ["medium", form.medium as string | undefined],
    ["mediumStyle", form.mediumStyle as string | undefined],
    ["subject", form.subject as string | undefined],
    ["scene", form.scene as string | undefined],
    ["preset", form.preset as string | undefined],
    ["style", form.style as string | undefined],
    ["cameraPerspective", form.cameraPerspective as string | undefined],
    ["lensLook", form.lensLook as string | undefined],
    ["depthOfField", form.depthOfField as string | undefined],
    ["composition", form.composition as string | undefined],
    ["lighting", form.lighting as string | undefined],
    ["colorGrading", form.colorGrading as string | undefined],
    ["artStyle", form.artStyle as string | undefined],
    ["detailLevel", form.detailLevel as string | undefined],
    ["aspectRatio", form.aspectRatio as string | undefined],
    ["outputTarget", form.outputTarget as string | undefined],
    ["backgroundType", form.backgroundType as string | undefined],
    ["mood", form.mood as string | undefined],
    ["qualityBooster", form.qualityBooster as string | undefined],
    ["referencePhotoMode", form.referencePhotoMode as string | undefined],
  ];

  return fieldMap
    .filter(([, value]) => value && value !== "")
    .map(([key, value]) => `- ${key}: ${value}`)
    .join("\n");
}

export function buildGeneratorPrompt(form: GenerateOptions) {
  const presetGuidance = form.preset && form.preset !== "custom" ? PRESET_GUIDANCE[form.preset] ?? "" : "";
  const outputGuidance = form.outputTarget ? OUTPUT_TARGET_GUIDANCE[form.outputTarget] ?? "" : "";
  const controlLines = buildControlLines(form);

  return `
Modus: Prompt-Generator

Nutzeridee:
${form.idea || "Keine Nutzeridee angegeben."}

${controlLines ? `Ausgewaehlte kreative Steuerung:\n${controlLines}` : "Keine kreative Steuerung ausgewaehlt – verwende eigene kreative Entscheidungen."}

Wichtig:
- Die ausgewaehlten Werte koennen intern englisch sein. Interpretiere sie korrekt, aber formuliere die Ausgabe vollstaendig auf Deutsch.
- Erzeuge genau einen idealen Endprompt, keine Varianten und keine Kurzversion.
- Felder ohne Auswahl müssen als deaktiviert angesehen werden.

Ziel:
Erstelle einen hochwertigen Bildprompt, der premium, kohaerent und bewusst inszeniert wirkt.
Ergaenze fehlende Details nur dort, wo sie das Ergebnis wirklich verbessern, und fuege keine zufaelligen Requisiten oder widerspruechlichen Story-Elemente hinzu.
Uebersetze die gewaehlten Controls in natuerliche Prompt-Sprache, statt sie mechanisch zu kopieren.
Sorge dafuer, dass Komposition, Licht, Umgebung und Motivgestaltung bewusst gestaltet statt generisch wirken.
Nutze stilgerechte Sprache:
- fotografische oder filmische Stile duerfen Kamera-, Objektiv- und Kompositionssprache nutzen
- Anime, Aquarell, malerische oder illustrative Stile sollen medienspezifisch formuliert werden
${presetGuidance ? `Preset-Hinweis:\n${presetGuidance}` : ""}
${outputGuidance ? `Ausgabeziel-Hinweis:\n${outputGuidance}` : ""}

${form.referencePhotoMode === "use reference photo" ? `
ACHTUNG - REFERENZFOTO MODUS AKTIV:
Der Nutzer wird dieses Bild mit einem Gesicht/Bild als Referenz (ControlNet/Image-to-Image) generieren.
- Mache NIEMALS ein neues Motiv oder eine generische Person daraus (kein "30-year-old man", "beautiful woman").
- Das Prompt MUSS signalisieren, dass die exakte Person aus der Referenz beibehalten wird.
- Nutze zwingend Formulierungen wie "same person", "exact likeness", "preserving facial features".
- Konzentriere deine Optimierung auf Szene, Licht, Kameraperspektive und Stil, veraendere aber nicht die Identitaet.
` : ""}`.trim();
}

export function buildImageToPromptPrompt(additionalDirection?: string) {
  return `
Modus: Bild zu Prompt

Der Nutzer hat ein Referenzbild hochgeladen.

Zusatzvorgabe:
${additionalDirection?.trim() || "Keine"}

Ziel:
Analysiere das hochgeladene Bild und rekonstruiere daraus einen hochwertigen Prompt fuer die Bildgenerierung.
Identifiziere die wichtigsten visuellen Anker: Motiv, Pose, Bildausschnitt, Umgebung, Licht, Stimmung, Farbwelt, Materialien, Stilbehandlung und auffaellige Kompositionsentscheidungen.
Der optimizedPrompt muss die beste rekonstruierte und zugleich verstaerkte Idealversion des sichtbaren Motivs sein.
Der negativePrompt soll sich auf typische Fehler konzentrieren, die die Bildtreue zur Vorlage brechen wuerden.
Wenn die Zusatzvorgabe hilfreich ist, integriere sie sinnvoll, ohne das sichtbar vorhandene Bild zu ueberlagern.
Erzeuge genau einen Hauptprompt, keine Varianten und keine Kurzversion.
`.trim();
}

export function buildOptimizerPrompt(rawPrompt: string, modifier?: string) {
  return `
Modus: Prompt-Optimierer

Bestehender Prompt:
${rawPrompt}

Zusatzvorgabe:
${modifier || "Keine"}

Ziel:
Analysiere Schwaechen und schreibe den Prompt in eine deutlich bessere, professionellere Version um.
Bewahre Motiv, Absicht und Stilrichtung des Originals, ausser sie sind klar widerspruechlich oder zu vage fuer ein gutes Bild.
Behebe Probleme wie Vagheit, Wiederholungen, flache Sprache, schwache Komposition, generisches Licht, fehlende Umgebungslogik, schlechte Struktur, Ueberladung oder mangelnde Stilspezifik.
Wenn der Originalprompt bereits gut ist, verfeinere ihn statt seine Absicht zu ersetzen.
Der optimizedPrompt soll die bestmoegliche, staerkere und zugleich treue Endversion des bestehenden Prompts sein.
Erzeuge genau einen Hauptprompt, keine Varianten und keine Kurzversion.
`.trim();
}

export function parsePromptResponse(text: string): ImagePromptResponse {
  try {
    let cleanText = text.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.substring(7);
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.substring(3);
    }
    if (cleanText.endsWith('```')) {
      cleanText = cleanText.substring(0, cleanText.length - 3);
    }
    const parsed = JSON.parse(cleanText.trim());
    return {
      title: parsed.title || "Generierter Prompt",
      optimizedPrompt: parsed.optimizedPrompt || "",
      negativePrompt: parsed.negativePrompt || "",
      styleTags: Array.isArray(parsed.styleTags) ? parsed.styleTags : [],
      cameraSuggestions: Array.isArray(parsed.cameraSuggestions) ? parsed.cameraSuggestions : [],
      lightingSuggestions: Array.isArray(parsed.lightingSuggestions) ? parsed.lightingSuggestions : [],
      improvementNotes: Array.isArray(parsed.improvementNotes) ? parsed.improvementNotes : [],
    };
  } catch (err) {
    console.error("Failed to parse prompt response:", text);
    return {
      title: "Generierungsfehler",
      optimizedPrompt: text,
      negativePrompt: "",
      styleTags: [],
      cameraSuggestions: [],
      lightingSuggestions: [],
      improvementNotes: ["Konnte die JSON-Antwort nicht parsen."],
    };
  }
}
