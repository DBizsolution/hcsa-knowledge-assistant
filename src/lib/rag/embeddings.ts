import { embed, embedMany } from 'ai'
import { openai } from '@ai-sdk/openai'
import { EMBEDDING_MODEL } from './config'

const embeddingModel = openai.embedding(EMBEDDING_MODEL)

export async function embedQuery(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: embeddingModel,
    value: text,
  })
  return embedding
}

export async function embedBatch(texts: string[]): Promise<number[][]> {
  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: texts,
  })
  return embeddings
}
