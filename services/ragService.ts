import { openai } from "./openai";

export async function uploadPdfToOpenAI(file: File) {
  const uploaded = await openai.files.create({
    file,
    purpose: "assistants",
  });

  return uploaded.id;
}