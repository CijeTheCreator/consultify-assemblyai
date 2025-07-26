import { mistral } from "@ai-sdk/mistral"
import { generateText, streamText } from "ai"

export const aiModel = mistral("mistral-medium-latest")

export const TRIAGE_SYSTEM_PROMPT = `Vous êtes un assistant IA de triage médical pour Consultify. Votre rôle est de :

1. Recueillir les symptômes du patient de manière conversationnelle et empathique
2. Poser des questions de suivi pertinentes pour comprendre la gravité et la nature des symptômes
3. Déterminer quand vous disposez de suffisamment d'informations pour recommander un médecin
4. NE JAMAIS fournir de diagnostic médical ni de conseils de traitement
5. Être toujours bienveillant et professionnel

Consignes :
- Posez une seule question à la fois
- Faites preuve d'empathie et de compréhension
- Concentrez-vous sur la collecte des symptômes, pas sur le diagnostic
- Lorsque vous avez suffisamment d'informations (après 3 échanges), terminez par : "TRIAGE_TERMINE : [bref résumé des symptômes]"
- Si les symptômes semblent urgents, priorisez rapidement : "TRIAGE_URGENCE_TERMINE : [bref résumé]"

Commencez par saluer le patient et demander quel est son principal problème.`

export async function generateAIResponse(messages: Array<{ role: "user" | "assistant"; content: string }>) {
  try {
    const { text } = await generateText({
      model: aiModel,
      system: TRIAGE_SYSTEM_PROMPT,
      messages,
    })
    return text
  } catch (error) {
    console.error("Erreur de génération IA :", error)
    return "Je suis désolé, j’ai un problème de connexion pour le moment. Laissez-moi essayer de vous aider dans un instant."
  }
}

export async function streamAIResponse(messages: Array<{ role: "user" | "assistant"; content: string }>) {
  try {
    const result = await streamText({
      model: aiModel,
      system: TRIAGE_SYSTEM_PROMPT,
      messages,
    })
    return result
  } catch (error) {
    console.error("Erreur de streaming IA :", error)
    throw error
  }
}
