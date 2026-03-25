import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: Request) {
  try {
    const aiKey = process.env.GEMINI_API_KEY;
    if (!aiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured in .env.local" },
        { status: 500 }
      );
    }

    const { name, location, price, leader, status, currentDescription } = await req.json();

    const ai = new GoogleGenAI({ apiKey: aiKey });

    const prompt = `
You are an expert travel and trek copywriter.
${currentDescription ? "Please REWRITE and ENHANCE the following trek description based on the provided details." : "Please GENERATE an exciting, engaging trek description based on the provided details."}

Trek Name: ${name}
Location: ${location}
Price: ₹${price}
Leader: ${leader || "TBA"}
Status: ${status}
${currentDescription ? `\nOriginal Description / Draft:\n${currentDescription}` : ""}

Provide a rich, attractive description (~3-4 short paragraphs) that would appeal to adventurous travelers. Do not include a title like "Title: ...", just return the text.
    `.trim();

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const generatedText = response.text || "";

    return NextResponse.json({ description: generatedText });
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}
