import { Injectable, MessageEvent } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import OpenAI from 'openai'
import { Observable } from 'rxjs'
import { localAnswer } from './local'

const SYSTEM_PROMPT = `You are Fin, the friendly finance assistant for FinFlow, a personal finance app.
You help users understand their spending, build budgets, and make sensible money decisions.
Answer in plain, concise language: 2-4 short sentences, no markdown, no bullet lists.
If asked about data you don't have, explain what they can do in the app instead.
Never invent account numbers or balances.`

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'
const OPENROUTER_MODEL = 'liquid/lfm-2.5-2.6b:free'

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string }

@Injectable()
export class ChatService {
  private readonly openaiClient: OpenAI | null
  private readonly openaiModel: string
  private readonly openrouter: OpenAI | null

  constructor(config: ConfigService) {
    const openaiKey = config.get<string>('OPENAI_API_KEY')
    this.openaiModel = config.get<string>('OPENAI_MODEL') ?? 'gpt-4o-mini'
    this.openaiClient = openaiKey ? new OpenAI({ apiKey: openaiKey }) : null

    const openrouterKey = config.get<string>('OPENROUTER_API_KEY')
    this.openrouter = openrouterKey
      ? new OpenAI({ apiKey: openrouterKey, baseURL: OPENROUTER_BASE_URL })
      : null
  }

  private messages(history: ChatMessage[], message: string): ChatMessage[] {
    return [{ role: 'system', content: SYSTEM_PROMPT }, ...history, { role: 'user', content: message }]
  }

  async answer(message: string, history: ChatMessage[] = []) {
    const msgs = this.messages(history, message)
    try {
      if (this.openrouter) return await this.askOpenRouter(msgs)
    } catch {
      /* fall through */
    }
    try {
      if (this.openaiClient) return await this.askOpenAI(msgs)
    } catch {
      /* fall through */
    }
    return localAnswer(message)
  }

  stream(message: string, history: ChatMessage[] = []): Observable<MessageEvent> {
    const msgs = this.messages(history, message)
    return new Observable<MessageEvent>((subscriber) => {
      void (async () => {
        try {
          try {
            if (this.openrouter) {
              await this.streamOpenRouter(msgs, (delta) => subscriber.next({ data: { delta } }))
            } else {
              throw new Error('OpenRouter not configured')
            }
          } catch {
            try {
              if (this.openaiClient) {
                await this.streamOpenAI(msgs, (delta) => subscriber.next({ data: { delta } }))
              } else {
                throw new Error('OpenAI not configured')
              }
            } catch {
              const text = localAnswer(message)
              for (let i = 0; i < text.length; i += 24) {
                subscriber.next({ data: { delta: text.slice(i, i + 24) } })
              }
            }
          }
          subscriber.next({ data: { done: true } })
          subscriber.complete()
        } catch (fatal) {
          subscriber.next({
            data: { error: 'I could not reach an AI service right now. Please try again in a moment.' },
          })
          subscriber.complete()
        }
      })()
    })
  }

  private async askOpenRouter(messages: ChatMessage[]): Promise<string> {
    const res = await this.openrouter!.chat.completions.create({
      model: OPENROUTER_MODEL,
      messages: messages as never,
    })
    return res.choices[0]?.message?.content ?? ''
  }

  private async askOpenAI(messages: ChatMessage[]): Promise<string> {
    const res = await this.openaiClient!.chat.completions.create({
      model: this.openaiModel,
      messages: messages as never,
    })
    return res.choices[0]?.message?.content ?? ''
  }

  private async streamOpenRouter(messages: ChatMessage[], emit: (delta: string) => void): Promise<void> {
    const request = this.openrouter!.chat.completions.create({
      model: OPENROUTER_MODEL,
      stream: true,
      messages: messages as never,
    })
    const stream = await request
    for await (const part of stream) {
      const delta = part.choices[0]?.delta?.content ?? ''
      if (delta) emit(delta)
    }
  }

  private async streamOpenAI(messages: ChatMessage[], emit: (delta: string) => void): Promise<void> {
    const request = this.openaiClient!.chat.completions.create({
      model: this.openaiModel,
      stream: true,
      messages: messages as never,
    })
    const stream = await request
    for await (const part of stream) {
      const delta = part.choices[0]?.delta?.content ?? ''
      if (delta) emit(delta)
    }
  }
}