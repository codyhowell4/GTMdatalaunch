import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ChatSession } from "@google/generative-ai";
import { Business } from '../types';
import { parseMarkdownTable } from '../utils/helpers';

const API_KEY = process.env.API_KEY || '';

export const createChatSession = (): ChatSession => {
  if (!API_KEY) {
    throw new Error("API_KEY is missing. Please check your environment configuration.");
  }

  const ai = new GoogleGenerativeAI(API_KEY);

  // System instruction sets the behavior for the entire session
  const systemInstruction = `
    You are "ClientScout", an expert lead generation agent.
    
    CORE OBJECTIVE:
    Produce a high-quality dataset of businesses with COMPLETE contact info.
    
    THE "ENRICHMENT" RULE (CRITICAL):
    1. Google Maps usually provides the Name, Address, Phone, and Rating.
    2. It RARELY provides the **Website** and **Email**.
    3. **YOU MUST USE GOOGLE SEARCH** for every single business to find the missing Website and Email.
       - Search Query Template: "[Business Name] [City] official site email contact".
       - Look for "info@", "contact@", "hello@", or "support@" in the search snippets.
    
    EXECUTION PROTOCOL:
    1. **Search Maps**: Get the list of businesses.
    2. **Enrich**: For EACH business, run a Google Search to find the Website and Email.
    3. **Compile**: Create the final table.
    
    OUTPUT FORMAT (Markdown Table Only):
    | Name | Phone | Email | Address | Website | Rating | Google Maps URL |
    
    FORMATTING RULES:
    - **Name**: Business Name.
    - **Phone**: Format consistently (e.g. (555) 123-4567).
    - **Email**: The extracted email address (e.g. info@company.com). If absolutely not found after searching, write "N/A".
    - **Address**: Full address.
    - **Website**: The raw URL (e.g. https://www.example.com).
    - **Rating**: Format as "4.8 (150)" if available.
    - **Google Maps URL**: Direct link.
    
    Do not output any text other than the table.
  `;

  const model = ai.getGenerativeModel({
    model: 'gemini-2.0-flash-exp',
    systemInstruction: systemInstruction,
    tools: [{ googleSearch: {} }],
  });

  return model.startChat({
    generationConfig: {
      maxOutputTokens: 8192,
    },
  });
};

export const searchBusinesses = async (chat: ChatSession, query: string): Promise<Business[]> => {
  const prompt = `
    Task: Find businesses for "${query}".
    
    Steps:
    1. Use 'googleMaps' to find the businesses. Try to get at least 20 results.
    2. **MANDATORY ENRICHMENT**: Loop through the results. For EACH business, use 'googleSearch' to find:
       - The official **Website**.
       - A valid **Email Address** (look for contact pages).
    3. Output the final data in the markdown table.
    
    Columns: | Name | Phone | Email | Address | Website | Rating | Google Maps URL |
  `;

  try {
    const response = await chat.sendMessage(prompt);
    const text = response.response.text();

    if (!text) {
      throw new Error("No text response received from Gemini.");
    }

    console.log("Gemini Search Response:", text);
    return parseMarkdownTable(text);

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to fetch businesses.");
  }
};

export const loadMoreBusinesses = async (chat: ChatSession): Promise<Business[]> => {
  const prompt = `
    Task: Find MORE unique businesses for the previous request.
    
    Steps:
    1. Find new businesses not listed yet.
    2. **Enrichment**: For every new business, SEARCH for the **Website** and **Email**.
    3. Output the new rows in the same table format.
  `;

  try {
    const response = await chat.sendMessage(prompt);
    const text = response.response.text();

    if (!text) {
      throw new Error("No text response received from Gemini.");
    }

    console.log("Gemini Load More Response:", text);
    return parseMarkdownTable(text);

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to fetch more businesses.");
  }
};
