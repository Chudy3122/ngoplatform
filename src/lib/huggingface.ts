// src/lib/huggingface.ts
"use client";

export async function getAIResponse(prompt: string): Promise<string> {
  if (!process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY) {
    throw new Error('HUGGINGFACE_API_KEY is not set');
  }

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1",
      {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: `<s>[INST] Jesteś asystentem czatu NGO Platform. Odpowiadaj tylko w języku polskim. Bądź profesjonalny, ale przyjazny. Nie wspominaj o innych platformach ani domenach. Twoja odpowiedź powinna być zwięzła i na temat. Oto pytanie: ${prompt} [/INST]`,
          parameters: {
            max_new_tokens: 500,
            temperature: 0.7,
            top_p: 0.95,
            do_sample: true,
            return_full_text: false
          }
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    const generatedText = result[0]?.generated_text || result.generated_text || "";
    
    const cleanResponse = generatedText
      .replace(/<s>|\[INST\]|\[\/INST\]|<\/s>/g, '')
      .trim();

    return cleanResponse || "Przepraszam, wystąpił problem z generowaniem odpowiedzi.";
  } catch (error) {
    console.error('Error getting AI response:', error);
    throw error;
  }
}