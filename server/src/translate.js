const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function translateToEnglish(text) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set in server/.env");
  }

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || "openai/gpt-oss-20b",
      temperature: 0,
      messages: [
        {
          role: "system",
          content:
            "Translate the user's chat message to English. Reply with only the translation, no quotes or explanation. If the message is already English, return it unchanged.",
        },
        { role: "user", content: text },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`Groq request failed (${res.status})`);
  }

  const data = await res.json();
  const translated = data.choices?.[0]?.message?.content?.trim();
  if (!translated) throw new Error("Groq returned an empty translation");
  return translated;
}
