import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const prompts = [
  {
    id: "93fd3447-8617-4efe-85b1-c5f5975ee38e",
    type: "image",
    title: "Mafiaboss mit Löwe",
    content: `Use the uploaded reference photo as a strict visual reference for the person.
Preserve identity, facial features, proportions, skin tone and expression exactly.
Do not alter the face. Do not beautify or stylize facial structure.

Create a highly realistic, cinematic scene featuring the same person from the reference photo, seated in a luxurious private lounge.

Appearance & Outfit:
The person wears a modern white tailored suit, perfectly fitted, paired with a gold luxury watch and matching gold bracelet.
Body type, posture and overall proportions must match the reference photo.

Action:
The person is lighting a cigar with a wooden match, captured mid-motion.
Thick, elegant smoke rises slowly, interacting naturally with the light.

Environment & Props:
On a polished dark table in front of him:
– a silver ice bucket containing The Macallan 1926 bottle
– crystal whiskey glasses with amber liquid
– visible ice cubes
– an elegant hookah beside the table

The lounge features rich dark wooden wall panels, deep velvet sofas, and an exclusive luxury atmosphere.

Additional Elements:
– A calm yellow tiger sits beside him, symbolizing power and control
– Four armed bodyguards stand behind him in soft focus, dressed in dark suits

Lighting & Mood:
Low-key cinematic lighting, dramatic shadows, warm highlights, volumetric smoke, shallow depth of field, subtle film grain.

Style & Quality:
Hyper-realistic photography, ultra-detailed textures, cinematic color grading, luxury crime-movie aesthetic, 8K realism.`,
    category: "Portrait",
    tags: "[]",
    isFavorite: false,
    imageUri: "/uploads/636d93e2-eef2-44b0-878a-d624769cc49b.png",
    createdAt: "2026-03-13T13:07:36.160Z",
  },
  {
    id: "be6466fd-49f8-4f6f-9a38-9eb64fc9b587",
    type: "image",
    title: "Luxus Influenza Dubai",
    content: "Convert the portrait into a luxury lifestyle influencer aesthetic. The subject is on a rooftop with an infinity pool at golden hour, overlooking a sprawling city skyline like Dubai or New York. They are wearing designer sunglasses and a fashionable outfit. A glass of champagne is in hand. The lighting is warm, golden, and dream-like, creating soft lens flare. The image should feel aspirational, stylish, and effortlessly cool.",
    category: "Other",
    tags: "[]",
    isFavorite: false,
    imageUri: "/uploads/99d0a2a0-3008-4bb3-bf19-0c5248adcf66.png",
    createdAt: "2026-03-14T09:03:06.419Z",
  },
  {
    id: "acddfa03-38e1-4a21-ae67-57681c228ad5",
    type: "image",
    title: "Katze mit Teddybär",
    content: "Erstelle eine hyperrealistische Nahaufnahme von meinen Katzen wie sie mit einem Teddybär kuschelt und dabei auf dem Boden liegt. Beide Pfoten sollen zu sehen sein.Das Bild Soll vertikal sein in einer 8K HD Qualität. Nutze dabei das original Fell meiner Katzen und lasse das ganze aussehen wie von einem Fotografen. Der Hintergrund soll dunkel sein und füge die passende Studio Beleuchtung hinzu",
    category: "Other",
    tags: "[]",
    isFavorite: false,
    imageUri: "/uploads/428cf079-36e1-4e34-83d9-f3efae8a993c.png",
    createdAt: "2026-03-14T09:07:47.161Z",
  },
  {
    id: "a70d62a4-344e-4d1a-9a27-af3982d1f19f",
    type: "image",
    title: "Nichts sehen, nichts hören, nichts sagen",
    content: `Create an ultra-wide cinematic landscape triptych featuring the three cats from the reference image, each shown as a head-and-shoulder portrait. Place them evenly across the frame with perfect visual balance and identical side margins. From left to right, show the gestures “see no evil,” “hear no evil,” and “speak no evil,” with each cat using its paws to cover the corresponding facial feature. Make sure every head, every paw, and the full shoulder frame are completely visible with clean spacing above the heads and below the shoulders.

Use a dark, atmospheric background that blends soft gradients, subtle fog, and faint abstract shapes to create depth and mood without distracting from the subjects. The scene should feel dramatic, elegant, and slightly mysterious—like a cinematic poster with stylized ambiance.

Illuminate the cats with a moody Cold Starlight glow, combining cool highlights and soft shadows that sculpt the fur texture and facial structure. Add gentle rim light from the sides to enhance separation from the background. Keep lighting, contrast, and color grading fully consistent across all three portraits.

Render the image with ultra-sharp clarity, rich detail, smooth fur definition, crisp paws, and expressive eyes. Use a 21:9 landscape aspect ratio to preserve the full width of the triptych and ensure nothing is cropped. The final result should feel premium, dramatic, and print-ready—perfect for posters, wall art, or apparel.`,
    category: "Other",
    tags: "[]",
    isFavorite: false,
    imageUri: "/uploads/e4502496-00a5-433d-8d86-9274285ed007.png",
    createdAt: "2026-03-14T09:08:18.312Z",
  },
  {
    id: "bece8376-b6aa-4b16-a15e-9034165de5ce",
    type: "image",
    title: "Aquarell-Porträt",
    content: `Erzeuge ein ausdrucksstarkes Aquarell-Porträt meiner Katze im Stil "Aquarell-Explosion", basierend auf dem hochgeladenen Referenzbild. Detaillierte Darstellung der Gesichtszüge, mit besonderem Fokus auf die präzise Wiedergabe der Iris-Textur, der Nasenlöcher und der einzelnen Schnurrhaare. Nutze diffuse, gleichmäßige indirekte Tageslichtbeleuchtung, um die subtilen Schattierungen und Texturen des Fells hervorzuheben. Der Hintergrund ist reinweiß (#FFFFFF) und vollständig frei von Elementen oder Mustern. Der künstlerische Stil kombiniert dynamische Aquarelltechniken mit sichtbaren Farbspritzern und weichen, halbtransparenten Farbverläufen, um eine moderne, expressive Ästhetik zu erzielen.`,
    category: "Other",
    tags: "[]",
    isFavorite: false,
    imageUri: "/uploads/8447eecd-9898-4fe7-83f3-dbca0e5f3f3c.png",
    createdAt: "2026-03-14T09:09:44.910Z",
  },
  {
    id: "a318a24f-e2f5-4cdc-b593-2947b2ba66b0",
    type: "image",
    title: "Aquarell",
    content: "Erstelle eine hyperrealistische Nahaufnahme von meinen Katzen wie sie mit einem Teddybär kuschelt und dabei auf dem Boden liegt. Beide Pfoten sollen zu sehen sein.Das Bild Soll vertikal sein in einer 8K HD Qualität. Nutze dabei das original Fell meiner Katzen und lasse das ganze aussehen wie von einem Fotografen. Der Hintergrund soll dunkel sein und füge die passende Studio Beleuchtung hinzu",
    category: "Other",
    tags: "[]",
    isFavorite: false,
    imageUri: "/uploads/ce8a48aa-4de1-4164-92be-a2bd009bd844.png",
    createdAt: "2026-03-14T09:10:14.227Z",
  },
  {
    id: "31f0626d-0bf3-4e42-8266-954360493760",
    type: "image",
    title: "Katze im Himmel",
    content: "“Turn this photo into a peaceful, ultra-realistic 8K dreamy portrait of my cat sleeping on soft white clouds as if it is floating in the sky. Add soft golden sunlight and light rays from above. Surround it with small glowing sparkles and feathers. My cat should look peaceful and angelic. Extremely detailed fur, soft pink nose, visible whiskers, dreamy color palette, blurred fantasy background, ultra-soft lighting, photorealistic fantasy artwork in 8K quality.”",
    category: "Other",
    tags: "[]",
    isFavorite: false,
    imageUri: "/uploads/c0a9a468-e5ad-4ae5-9cf7-9fb5dce1d488.png",
    createdAt: "2026-03-14T09:11:16.076Z",
  },
  {
    id: "51217d95-6b45-4938-b58b-7481cc7fd93e",
    type: "image",
    title: "S/W Portrait",
    content: "Create a cinematic black and white portrait of me adjusting my tie while wearing a classic, tailored suit. I stand confidently in a studio with strong side lighting, creating .high contrast Horizontal streaks of light (like light coming thou curtains create shadovs on my face and suit. The expression is calm and confident, exuding elegance and determination. High fashion photography style, highly detailed, minimal and symmetrical composition.",
    category: "Other",
    tags: "[]",
    isFavorite: false,
    imageUri: "/uploads/252db590-3419-4595-a305-f245b216eed7.png",
    createdAt: "2026-03-14T09:11:40.554Z",
  },
  {
    id: "1f626cd6-f873-4369-afef-3a5db92f3417",
    type: "image",
    title: "Tierportrait 3",
    content: "Hochdetailliertes digitales Aquarell-Porträt. Malerischer Stil mit sichtbaren Pinselstrichen, die eine realistische Textur erzeugen, besonders im Fell. Hoher Kontrast zwischen tiefen Schwarz- und Grautönen des Motivs und dem hellen Hintergrund. Der Hintergrund ist nicht weiß, sondern besteht aus dynamischen, abstrakten grauen und schwarzen Aquarell-Splashes, Flecken und Ink-Splatter-Effekten. Nutze das hochgeladene Foto als Referenz. Behalte die Gesichtsstruktur, Fellstruktur und Grundfarben bei. Die Hintergrundfarben des neuen Bildes sollen an das Hauptmotiv angepasst werden.",
    category: "Other",
    tags: "[]",
    isFavorite: false,
    imageUri: "/uploads/9929316e-e520-431e-b390-0b83e19d9a7e.png",
    createdAt: "2026-03-14T09:12:09.995Z",
  },
  {
    id: "121e4e9b-ba2a-41ce-b04b-26c69c73668d",
    type: "image",
    title: "Schmetterling auf der Nase",
    content: `Use the uploaded image as the only and strict reference for the cat.

Preserve the cat 100% identical (fur color & pattern, eye color, facial structure, proportions). No changes.
Create a hyper-realistic macro close-up portrait of the cat’s face and head only.

A butterfly gently rests on the cat’s nose with physically accurate, real-world scale (small, delicate, anatomically correct — not oversized).

Butterfly wings: blue, white, orange, black, realistic texture and veins.
Professional studio photography, soft diffused lighting, shallow depth of field, sharp focus on eyes and butterfly, visible fur micro-details, natural eye reflections.
Clean dark gray background, uniform, no shadows, no objects.
Ultra-photorealistic, photographic style.`,
    category: "Other",
    tags: "[]",
    isFavorite: false,
    imageUri: "/uploads/09d88c12-ee61-4f08-9d94-8b1fd8b2bc59.png",
    createdAt: "2026-03-14T09:12:32.591Z",
  },
  {
    id: "652ef342-278b-429b-859b-36e7513bc06f",
    type: "image",
    title: "Son-Goku Referenzfoto",
    content: "“Create an image of a man who has taken off his shirt, showing his large arm muscles, wearing karate pants in red-orange color with a black belt. His facial expression looks angry, and he has an aura glowing around his body in gold. The background behind him is a mountainous area. The image should be ultra-realistic.”",
    category: "Other",
    tags: "[]",
    isFavorite: false,
    imageUri: "/uploads/26d91c37-5e98-44d4-8736-dc9402be6166.png",
    createdAt: "2026-03-14T09:12:55.164Z",
  },
  {
    id: "b2ecca98-0703-43a9-9f59-81a615be5c56",
    type: "image",
    title: "Coole Katze mit Sonnenbrille und Wollmütze",
    content: `A cat from the provided reference photo, wearing a black knitted cap and round sunglasses, with a slightly casual posture. The cat is positioned slightly to the left of the center, facing to the right in a half-side perspective. Keep the cat’s original fur color, texture, and facial features from the reference photo. The background is beige, simple and clean, highlighting the cat. Soft light shines from the upper left, creating a warm atmosphere. The cat’s expression is slightly lazy and confident, giving a sense of ease and comfort. The composition is compact, with harmonious color matching, humorous and modern style, natural shadows, natural light, slightly grainy texture, and a subtly blurred background.
============================================================`,
    category: "Other",
    tags: "[]",
    isFavorite: false,
    imageUri: "/uploads/2f6df82d-2945-481b-bcc4-424c0eced820.png",
    createdAt: "2026-03-14T10:19:09.038Z",
  },
  {
    id: "7166f326-0d6d-4c72-8d9b-f8df56304452",
    type: "image",
    title: "Royal Cat",
    content: "Photorealistic digital illustration, Royal Animal Portrait. Use the exact subject, facial structure, eyes, and fur texture of the uploaded [Bild 2/Referenzfoto] as the core identity. The animal must be depicted wearing an ornate historical royal outfit (Baroque/Renaissance style, such as a rich velvet doublet, lace ruff, and a small crown or tiara), applied over the animal's body as seen in the style reference [Bild 1]. Style Application (from Bild 1): Lighting: Soft, dramatic studio lighting (Chiaroscuro/Rembrandt light) with defined highlights and soft shadows, creating a sense of volume and depth. Color & Grading: Deep, rich, warm, and highly saturated historical color palette (Gold, Crimson Red, Emerald Green, Royal Blue) with prominent gilded textures on the costume. Overall warm, aged grading. Camera & Focus: Classic centered portrait shot, medium close-up, with a very shallow depth of field (strong bokeh) to ensure absolute focus on the animal's face and the intricate detail of the costume. Texture & Finish: The animal's fur must remain razor-sharp and photorealistic. The surrounding costume and background should have the discernible texture of a masterful oil painting with visible brushstrokes. Atmosphere: Majestic, grand, and dignified. Subtle dark vignetting. Artist Style: Highly detailed, cinematic, high-resolution.",
    category: "Other",
    tags: "[]",
    isFavorite: false,
    imageUri: "/uploads/91b38669-a8be-4580-8c69-00ab9c4027ca.png",
    createdAt: "2026-03-14T10:19:28.882Z",
  },
  {
    id: "59448b21-ba13-4019-be90-b6cf239bd1d3",
    type: "image",
    title: "Schlafend in der Hand der Gefahr",
    content: `Use the provided reference image as the strict identity foundation for the miniature man. Preserve his exact facial structure, bone structure, skin tone, hairstyle, hairline, beard density, eyebrow shape, eye shape, nose proportions, lips, and overall recognizability. It must clearly be the same person as in the reference photo, only scaled down in size.

Ultra-realistic macro photograph of this exact person as a tiny adult man sleeping peacefully on a soft white pillow, placed gently on the open palm of a human hand. The miniature version must maintain natural skin texture, visible pores, subtle facial hair, realistic eyelashes, and lifelike facial proportions identical to the reference. His eyes are closed in a calm sleeping expression, with relaxed facial muscles and natural skin shading. Beside him stands Chucky, holding a knife in a threatening pose, creating tense cinematic contrast — but no gore, no visible injury.

His outfit consists of black and white striped pajamas made of soft cotton fabric, showing natural wrinkles, stitching seams, and realistic cloth tension where the body bends. The clothing fits naturally around his arms and legs with accurate fabric thickness, micro-folds, and soft shadow transitions.

His body is curled slightly on his side in a fetal sleeping position, one hand resting near the pillow, the other relaxed along his torso. The white pillow shows visible fabric weave, soft compression where his head rests, and subtle shadow gradients.

The human hand beneath him appears life-sized with detailed skin texture, palm lines, soft creases, fine wrinkles, and natural color variation. The scale contrast between the tiny sleeping man and the large hand must be physically believable and proportionally accurate.

Lighting is soft, cinematic, and directional from above, creating gentle shadows and warm highlights. Depth of field is shallow, with sharp focus on the miniature man and pillow, and a smooth dark blurred background (bokeh). Shot with a high-end full-frame camera, 100mm macro lens, f/2.8, ultra high resolution, hyper-detailed, photorealistic, natural color grading, no CGI look, no cartoon style, no stylization.`,
    category: "Other",
    tags: "[]",
    isFavorite: false,
    imageUri: "/uploads/12e6a076-787a-49de-84c0-5193e896db70.png",
    createdAt: "2026-03-14T10:19:50.884Z",
  },
  {
    id: "22cdf1af-d2c0-4270-8256-b3883dff83f9",
    type: "image",
    title: "Halb Mensch halb Maschiene",
    content: `Verwende das hochgeladene Referenzfoto als exakte Basis für Gesicht, Pose und Blickrichtung.
Erstelle ein quadratisches Facebook-Profilbild im Hochformat-Crop (1:1), optimal zentriert für Profilanzeigen.

Das Gesicht ist exakt halbiert:

Linke Gesichtshälfte: realistischer Mensch, natürliches Hautbild, professionelle Ausstrahlung, seriöser KI-Experte

Rechte Gesichtshälfte: futuristische Maschine / KI-Interface, sichtbar mechanische Strukturen unter der Haut, feine Leiterbahnen, dezente Cyber-Elemente, leuchtende Akzente (Blau / Cyan)

Wichtig:

Gesichtsform, Augen, Nase, Mund und Proportionen müssen 100 % identisch zum Referenzfoto bleiben

Keine Karikatur, kein Comic, kein Anime

Mensch und Maschine perfekt symmetrisch entlang der Gesichtsmittelachse

Ausdruck: ruhig, intelligent, vertrauenswürdig, souverän

Stil & Look:

High-end, fotorealistisch, cinematic lighting

Dunkler, cleaner Hintergrund (Anthrazit / Schwarz mit subtilen Tech-Patterns)

Weiches Keylight von vorne, feine Rim-Light-Akzente auf der Maschinenhälfte

Sehr hohe Detailtiefe, scharf, professionell, kein Rauschen

Branding-Ziel:

Vermittelt Kompetenz, Zukunftsdenken und Autorität im KI-Bereich

Geeignet als Facebook-Profilbild für eine KI-Experten-Seite

Negativvorgaben:

keine Verzerrungen

keine extra Texte oder Logos

keine Stilvermischung

keine Übertreibung der Maschinenoptik

kein Horror-Look

Ultra-realistisch, studio quality, clean, modern, professional, authoritative.`,
    category: "Other",
    tags: "[]",
    isFavorite: false,
    imageUri: "/uploads/67a1a7d6-807f-4067-a109-5ed9cd62260f.png",
    createdAt: "2026-03-14T10:20:35.067Z",
  },
  {
    id: "ea94ca46-82dd-4af6-af2a-1d4093abcb43",
    type: "image",
    title: "Winterkomposition – Mann und Wolf",
    content: `Use the provided reference image as the strict visual and structural foundation for composition, framing, camera height, perspective geometry, subject placement, background depth hierarchy, lens characteristics, lighting direction, horizon alignment, spatial balance, and overall cinematic color grading. Precisely replicate the reference image’s camera angle, focal length impression, depth compression, environmental layering, and visual proportions. Maintain identical foreground-to-background relationship, subject scale within frame, and atmospheric falloff as in the reference image.**

A man sitting calmly on snow in a winter forest, wearing a thick black winter jacket, black gloves, and dark clothing. A large wolf stands behind him with its front legs gently resting on his shoulders, creating a powerful and emotional bond between human and animal. Snow-covered trees fill the background with a soft, cold atmosphere. The lighting follows the exact same direction, softness, shadow behavior, and tonal contrast as in the reference image, adapted naturally to the winter environment. The cinematic grading, contrast curve, highlight roll-off, and color temperature must mirror the reference image precisely.

ultra realistic, photorealistic, high detail,
soft lighting,
wide angle shot matching the reference lens perspective,
epic mood, dramatic atmosphere consistent with the reference structure`,
    category: "Other",
    tags: "[]",
    isFavorite: false,
    imageUri: "/uploads/e0d83647-4247-42d9-b347-a47fcdbf1578.png",
    createdAt: "2026-03-14T16:36:04.097Z",
  },
  {
    id: "01390e82-7d65-46d9-ad12-087e71f32ac6",
    type: "image",
    title: "Goldene Stunde – Mann und Wolf",
    content: `Use the provided reference image as the strict visual and structural foundation for composition, framing, camera height, perspective geometry, subject placement, background depth hierarchy, lighting direction, and overall cinematic color grading. Replicate the exact spatial balance, horizon alignment, focal length impression, lens compression, and environmental layering from the reference image. Maintain the same camera distance, subject scale ratio, foreground-to-background separation, and atmospheric depth as seen in the reference photo.

A cinematic, ultra-realistic photo of a young man sitting calmly on dry golden grass in a field during sunset. He is wearing a fitted black cargo pants with subtle tactical pocket details and a stylish, well-tailored black polo shirt that complements the cargo pants perfectly, giving him a modern, confident, and clean aesthetic. He looks peaceful and composed. Beside him sits a large wolf, both looking in the same direction. The warm golden sunlight creates a soft, dreamy atmosphere, with blurred rocks and tall grass in the background. The image has a natural, emotional, and aesthetic vibe, perfect for a trending portrait photo.

ultra realistic, photorealistic, high detail,
soft lighting,
wide angle shot (matching the reference lens characteristics),
epic mood, dramatic atmosphere,
natural depth of field consistent with the reference image,
cinematic tonal contrast aligned with the reference color grading.`,
    category: "Other",
    tags: "[]",
    isFavorite: false,
    imageUri: "/uploads/b6e68d36-2d91-4e53-8889-16888674d048.png",
    createdAt: "2026-03-14T16:36:23.312Z",
  },
  {
    id: "693aa17d-3a54-4d4f-9c19-ea6592d2aae2",
    type: "image",
    title: "La Casa de Papel",
    content: "Ultra-realistic cinematic close-up of the person in the reference image, holding a La Casa de Papel mask that covers half of their face, giving off a cool, action-hero vibe. They're wearing the iconic red jumpsuit from the La Casa de Papel series. Behind them, people are running in panic through a dimly lit street, with a moody cinematic atmosphere. The scene is shot on 35mm film with shallow depth of field and vibrant ultra-detailed colors. Sharp focus on the main person, with slightly blurred background movement.",
    category: "Other",
    tags: "[]",
    isFavorite: false,
    imageUri: "/uploads/78fbd10b-8bad-40bc-8e61-ce4a3718f9a6.png",
    createdAt: "2026-03-14T16:36:41.427Z",
  },
  {
    id: "1cbde8e5-4e1d-4d48-8bb8-5c4be11f41b9",
    type: "image",
    title: "Ultra-realistisches cineastisches Fine-Art-Porträt – Mensch & Tier im Rauch",
    content: `Ultra-photorealistic cinematic vertical studio portrait of a person and their pet facing each other

Dramatic sculpted lighting, powerful swirling smoke, iconic fine-art poster composition.

⸻

📷 Composition (Vertical 2:3 – Premium Poster)

• Vertical 2:3 format
• Tight head-and-shoulders framing
• Person on the left in clean side profile
• Pet on the right in clean side profile
• Heads aligned at exactly the same height
• Eyes perfectly on the same horizontal line
• Faces very close — a narrow space between foreheads
• Pure deep black background

The framing must feel symmetrical, intentional, monumental.

⸻

💨 Smoke Swirl Effect (WOW ELEMENT)

Between and around their heads:

• Dense cinematic smoke filling the entire frame
• Smoke visible from top to bottom
• Thick swirling currents moving diagonally
• Fine smoke threads and vortex-like spirals
• Some smoke passing softly in front of them
• Some drifting behind them
• Light catching the edges
• Subtle turbulence patterns as if air is moving

The smoke should partially wrap around both heads,
but they are clearly emerging through it.

The smoke must look physical, heavy, textured —
not soft fog, not fantasy glow.

⸻

💡 Lighting (Dramatic Sculpting)

• Strong overhead key light
• Narrow beam cutting through smoke
• Light rays visible in smoke density
• Defined but natural shadow falloff on outer face edges
• Deep blacks in the background

Add:

• Subtle rim light outlining hair and fur/feathers (species-accurate)
• Clean, natural catchlights in both eyes
• Highlight streaks within smoke trails

The light should carve the smoke like sculpture,
while preserving lifelike skin and fur texture.

⸻

👤 Person

• Friendly, realistic expression
• Soft, warm eyes with natural emotion
• Subtle relaxed facial muscles
• Slight hint of a genuine smile (very understated)
• Natural skin texture visible
• Jawline gently sculpted by shadow

The gaze should feel calm, affectionate, grounded —
not intense, not confrontational.

⸻

🐾 Pet

• Head slightly lifted
• Eyes gently focused on the person
• Calm, trusting presence
• Fur/feathers/skin catching rim highlights (species-accurate)
• Fine anatomical details visible through smoke
• Soft but alert expression

⸻

🎨 Tone Options

Option 1:
High-contrast black and white (cinematic, emotional depth without aggression)

Option 2:
Dark cinematic color with cool shadows + subtle warm highlights on skin and fur

No glow filters.
No artificial haze.
No softness.

⸻

🔍 Detail Level

• Ultra-sharp eyes
• Micro texture preserved
• Smoke high resolution and detailed
• Visible density variation in smoke
• No blur except natural depth separation

⸻

🎭 Mood

Emerging through chaos.
Quiet strength.
Gentle connection.
Unspoken bond stronger than the storm around them.`,
    category: "Other",
    tags: "[]",
    isFavorite: false,
    imageUri: "/uploads/ac1793be-d500-45c1-8f95-874a0ef10d27.png",
    createdAt: "2026-03-14T16:37:39.763Z",
  },
  {
    id: "d1ed9c0e-2693-4de0-b3d7-719c7d627c9f",
    type: "image",
    title: "Jetset Noir Portrait",
    content: "Cinematic full-body shot of the man from the reference image, preserving his identity and hairstyle, captured on a private jet tarmac at night. Photographed with a 50mm lens at f/1.8 to achieve a shallow depth of field with soft bokeh on the distant airport runway lights. The lighting is dramatic, using high-contrast rim lighting to highlight his silhouette against the dark, sleek fuselage of the jet. He is wearing a minimalist black turtleneck, a sharp tailored overcoat, and dark trousers. Professional color grading with deep cool tones and warm golden light accents, high-end editorial aesthetic, sharp focus on the subject, 8k resolution, photorealistic.",
    category: "Other",
    tags: "[]",
    isFavorite: false,
    imageUri: "/uploads/b1f4bb2b-7f7f-4370-95ed-c76415c4b681.png",
    createdAt: "2026-03-14T16:38:10.969Z",
  },
  {
    id: "a944c5e6-32ab-4960-b30a-72803f06dca5",
    type: "image",
    title: "Urbaner Outlaw",
    content: `A hyper-realistic 8k cinematic dynamic tracking shot, captured low to the ground, shows a high-speed motorcycle escape through the winding, narrow cobblestone streets of an ancient European city. The central figure is a person, with uploaded face as reference, wearing the black t-shirt, distressed blue jeans, and red and black sneakers, leaning aggressively into a tight turn on a sleek, stolen black sportbike. Sparks fly fiercely where the bike's footpeg grazes the uneven cobblestones. Just feet behind them, a heavy, armored enemy SUV is smashing through market stalls and wooden crates in hot pursuit, sending fruit and debris flying. The scene is chaotic. The lighting is late afternoon "golden hour," casting long, dramatic shadows and bathing the stone architecture in warm light. Motion blur emphasizes the incredible speed, keeping the rider in sharp focus.`,
    category: "Other",
    tags: "[]",
    isFavorite: false,
    imageUri: "/uploads/20f7d908-8718-45cd-a214-88346e3a4176.png",
    createdAt: "2026-03-14T16:38:32.056Z",
  },
  {
    id: "ba583bab-53a2-4b54-9e51-03a623e03bfb",
    type: "image",
    title: "Streetwear auf dem Thron",
    content: "Cinematic editorial portrait of Jo model, wearing oversized black streetwear and white sneakers with dark sunglasses, posed gracefully on an ornate black and gold throne. A majestic, giant white snow lion rests beside the throne. Shot with a 35mm lens, low-angle perspective, dramatic chiaroscuro lighting, soft studio shadows, muted moody color grading, hyper-realistic textures, 8k resolution, elegant atmosphere.",
    category: "Other",
    tags: "[]",
    isFavorite: false,
    imageUri: "/uploads/e31f0d09-ecd2-4c14-aecb-8b0990b04cc6.png",
    createdAt: "2026-03-14T16:38:47.628Z",
  },
  {
    id: "0df5dc1f-cf5c-4cb1-aed5-07ef2691e10e",
    type: "image",
    title: "Meisterwerk",
    content: "Ein detailreiches digitales Aquarellporträt eines Tieres, das dessen Gesichtszüge und die feine Fellstruktur mit ausdrucksstarken Pinselstrichen einfängt. Das Motiv hebt sich von einem dynamischen, abstrakten Hintergrund aus fließenden Tuschewaschungen, farbiger zum fell passenden Kohlespritzern und organischen Aquarellblüten ab. Die Farbpalette istharmonisch, wobei die Hintergrundtöne die Fellfarbe des Tieres widerspiegeln. Die Komposition betont den Kontrast zwischen den scharfen, realistischen Gesichtszügen und der chaotischen, künstlerischen Energie der tuschebespritzten Umgebung.",
    category: "Other",
    tags: "[]",
    isFavorite: false,
    imageUri: "/uploads/d86171a5-5fb6-4b68-8da8-4e47ef4e3800.png",
    createdAt: "2026-03-14T16:39:04.195Z",
  },
  {
    id: "859c025c-386a-43bb-a6a3-73a6eaf1101f",
    type: "image",
    title: "3D-Karikatur",
    content: "Eine hyperrealistische 3D-Karikatur eines stilisierten Charakters mit cooler, selbstbewusster Haltung und verschränkten Armen. Das **hochgeladene 200%-Gesicht als Referenz** ist nahtlos in einen übertriebenen anatomischen Stil mit großem Kopf und dünnen Beinen integriert. Die Figur trägt eine lässige coole Pilotensonnenbrille und hat eine brennende Zigarette im Mund, aus der eine realistische, feine weiße Rauchwolke aufsteigt. Ihr Haarstyling ist gepflegt. Das Outfit besteht aus einem oversized, schwarzen Smilodox sport wear, dazu eine silberne Panzerkette und eine Apple Watch. Er trägt locker sitzende, graue Jogginhose. Dazu kombiniert er schlichte weiße Adidas -Sneaker mit den typischen drei streifen. Die Szene wird mit weichem, volumetrischem Studiolicht ausgeleuchtet, wodurch die Lichtstreuung unter der Hautoberfläche und die feine Webstruktur der Denim- und Strohtexturen hervorgehoben werden. Der Hintergrund ist ein weichgezeichneter, malerischer Bokeh-Effekt in gedeckten Blau- und Brauntönen, mit einer verschwommenen Terrakotta-Topfpflanze auf der linken und einem hölzernen Liegestuhl auf der rechten Seite, gerendert im Stil eines hochwertigen 8k Octane Renders oder eines Pixar-Charakterdesigns mit extrem hoher Detailtreue.",
    category: "Other",
    tags: "[]",
    isFavorite: false,
    imageUri: "/uploads/67e4e337-d733-4190-81ae-2110e6f04c9f.png",
    createdAt: "2026-03-15T12:08:48.130Z",
  },
  {
    id: "14d8de1d-8ec3-410e-a271-29d2233e9298",
    type: "image",
    title: "ONELINE Cat",
    content: "Minimalist one-line drawing of the exact cat from the reference photo, accurately preserving its unique facial features, proportions, and tabby fur pattern. The entire cat is created using a single continuous, unbroken line without lifting the pen at any point. The line flows smoothly and naturally, forming the complete silhouette and essential details in one stroke. Clean, elegant, and highly refined linework with subtle variations in line thickness for depth and visual interest. No overlapping sketch lines, no shading, no color — only a pure black line on a clean white background. Modern minimal line art style, balanced composition, with a strong emphasis on fluidity, precision, and recognizability of the individual cat.",
    category: "Other",
    tags: "[]",
    isFavorite: false,
    imageUri: "https://prompt-craft.reutemann.xyz/uploads/282d8a11-21ed-4da1-b1b5-3575356c4a51.png",
    createdAt: "2026-03-21T10:35:55.751Z",
  }
];

async function seed() {
  console.log('Seeding Prompts...');
  let count = 0;
  for (const prompt of prompts) {
    try {
      await prisma.prompt.upsert({
        where: { id: prompt.id },
        update: {},
        create: {
          id: prompt.id,
          title: prompt.title,
          content: prompt.content,
          category: prompt.category,
          type: prompt.type,
          isFavorite: prompt.isFavorite,
          imageUri: prompt.imageUri,
          metadata: "{}",
          tags: "[]",
          createdAt: new Date(prompt.createdAt),
          updatedAt: new Date(prompt.createdAt),
        }
      });
      count++;
    } catch (e: any) {
      console.log(`Failed to seed ${prompt.title}:`, e.message);
    }
  }
  console.log(`Successfully seeded ${count} prompts.`);
}

seed()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
