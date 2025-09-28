import OpenAI from "openai";

export interface ProfileAnalysis {
  Privacidade: "Publica" | "Privada";
  nickname: string;
  following: number;
  followers: number;
  profissão: string | null;
  setor: string | null;
  precisao: number;
  gênero: string | null;
  link_perfil: string;
  nome: string;
}

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
    // apiKey: 
});

export async function analyzeProfile(
  data: string[],
  profileUrl: string,
  nickname: string
): Promise<ProfileAnalysis | null> {
  const systemPrompt = `
Você é um analisador de perfis do Instagram. 
A partir dos dados capturados, retorne em JSON no seguinte formato exato:

{
  "Privacidade": "Publica" | "Privada",
  "nickname": string,
  "following": number,
  "followers": number,
  "profissão": string | null,
  "setor": string | null,
  "precisao": number,
  "gênero": string | null,
  "link_perfil": string,
  "nome": string
}`;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Dados extraídos: ${JSON.stringify(data)}\nURL: ${profileUrl}\nNickname: ${nickname}`,
      },
    ],
    temperature: 0.2,
  });

  const content = response.choices[0].message?.content?.replace(/```json|```/g, "").trim();

  try {
    // return content as ProfileAnalysis;
    return JSON.parse(content || "") as ProfileAnalysis;
  } catch (err) {
    console.error("❌ Erro ao parsear resposta:", content);
    return null;
  }
}
