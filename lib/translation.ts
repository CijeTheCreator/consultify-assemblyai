// lib/translation.ts
import { LingoDotDevEngine } from "lingo.dev/sdk";
import { prisma } from "@/lib/prisma";

// Initialize the Lingo.dev SDK
const lingoDotDev = new LingoDotDevEngine({
  apiKey: process.env.LINGO_DEV_API_KEY!,
});

export interface TranslationOptions {
  messageId: string;
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
}

export async function translateMessage(options: TranslationOptions): Promise<string> {
  const { messageId, text, sourceLanguage, targetLanguage } = options;

  // If source and target languages are the same, return original text
  if (sourceLanguage === targetLanguage) {
    return text;
  }

  // Check if translation already exists in cache
  const existingTranslation = await prisma.messageTranslation.findUnique({
    where: {
      messageId_targetLanguage: {
        messageId,
        targetLanguage,
      },
    },
  });

  if (existingTranslation) {
    return existingTranslation.translatedText;
  }

  try {
    // Translate using Lingo.dev SDK
    const translatedText = await lingoDotDev.localizeText(text, {
      sourceLocale: sourceLanguage,
      targetLocale: targetLanguage,
    });

    // Cache the translation in the database
    await prisma.messageTranslation.create({
      data: {
        messageId,
        originalText: text,
        translatedText,
        sourceLanguage,
        targetLanguage,
      },
    });

    return translatedText;
  } catch (error) {
    console.error("Translation failed:", error);
    // Return original text if translation fails
    return text;
  }
}

export async function translateMultipleMessages(
  messages: Array<{
    id: string;
    content: string;
    senderId: string;
  }>,
  targetLanguage: string,
  senderLanguages: Map<string, string>
): Promise<Array<{ id: string; translatedContent: string }>> {
  const translations = await Promise.all(
    messages.map(async (message) => {
      const sourceLanguage = senderLanguages.get(message.senderId) || "en";
      const translatedContent = await translateMessage({
        messageId: message.id,
        text: message.content,
        sourceLanguage,
        targetLanguage,
      });
      return {
        id: message.id,
        translatedContent,
      };
    })
  );

  return translations;
}

export async function getLanguageFromUserId(userId: string): Promise<string> {
  const { supabase } = await import("@/lib/supabase-server");

  try {
    const { data: userData } = await supabase.auth.admin.getUserById(userId);
    return userData.user?.user_metadata?.language || "en";
  } catch (error) {
    console.error("Failed to fetch user language:", error);
    return "en"; // Default to English
  }
}
