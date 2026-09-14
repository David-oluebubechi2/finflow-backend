const WORDS = /[a-z0-9]+/g

function tokens(q: string) {
  return new Set(q.match(WORDS) ?? [])
}

function hit(q: string, words: string[], phrases: string[] = []): boolean {
  const t = tokens(q)
  return phrases.some((p) => q.includes(p)) || words.some((w) => t.has(w))
}

export function localAnswer(message: string): string {
  const q = message.toLowerCase()

  if (hit(q, [], ['how are you', "how's it going"])) {
    return "Doing great, thanks for asking! I'm Fin, your FinFlow assistant. What can I help you with today — budgets, saving, transfers, or accounts?"
  }

  if (hit(q, ['hello', 'hey', 'hi', 'howdy'], ['good morning', 'good afternoon', 'good evening'])) {
    return "Hey there! I'm Fin, your FinFlow assistant. Ask me about budgeting, saving, transfers, accounts, or how the app works."
  }

  if (hit(q, ['budget', 'budgets'], ['spending limit', 'over budget', 'set a budget', 'new budget', 'budget alert'])) {
    return "Budgets live on the Budgets page. Tap \u201cNew budget\u201d to pick a category, icon and a monthly limit. As transactions come in, FinFlow automatically tracks what you've spent and alerts you before you hit the limit. Over a limit? Raise it in the card menu or split spending into a new category."
  }

  if (hit(q, ['save', 'saving', 'savings'], ['how do i save', 'high yield', 'emergency fund'])) {
    return "A proven pattern is the 50/30/20 rule: 50% needs, 30% wants, 20% savings. Give your extra cash a job — open a High-Yield Savings account in Accounts, then set a recurring transfer right after payday so you save first, spend later."
  }

  if (hit(q, ['balance', 'balances', 'account', 'accounts', 'net worth'], ['total balance', 'how much do i have', 'add an account'])) {
    return "Your total balance is the sum of every account on the Accounts page — checking, savings, credit and investing. Add a new account to change it, or remove one you no longer use. The Dashboard cards, Accounts summary and Analytics net worth all update automatically."
  }

  if (hit(q, ['transfer', 'transfers', 'send', 'pay'], ['new transfer', 'move money', 'schedule a transfer'])) {
    return "Hit the \u201cNew transfer\u201d button in the top bar, pick the \u201cfund from\u201d and \u201cto\u201d accounts, enter the amount and a note, then confirm. It creates a real transaction and updates both balances instantly."
  }

  if (hit(q, ['transaction', 'transactions', 'payment', 'spending', 'merchant','export','csv'], ['past payments', 'filter transactions'])) {
    return "Every payment appears on the Transactions page. Search by merchant, filter by account or kind (money in / money out), and export a CSV from the toolbar whenever you need a copy for records."
  }

  if (hit(q, ['plan', 'plans', 'pro', 'business', 'pricing', 'unlock', 'upgrade'], ['go pro', 'starter plan'])) {
    return "FinFlow has Starter, Pro and Business plans. Pro and Business unlock unlimited budgets, forecasts and richer analytics. You can upgrade from Pricing or the \u201cUpgrade now\u201d card in the sidebar — it takes seconds."
  }

  if (hit(q, ['security', 'encrypt', 'encryption', 'safe', 'secure', 'privacy', 'private'])) {
    return "Good question. FinFlow protects your data with 256-bit encryption in transit and at rest. Passwords are hashed before they're stored, and every request is scoped to your account — so only you can see your finances."
  }

  if (hit(q, ['help', 'support'], ['how do i', 'how does', 'how can i', 'what does this do', 'what is finflow', 'what can you do'])) {
    return "Happy to help! I'm Fin, your in-app finance assistant. I can answer questions about budgets, saving, accounts, transfers, transactions, plans and security — and point you to the right screen. What would you like to know?"
  }

  if (hit(q, ['thank', 'thanks', 'appreciate'])) {
    return "Anytime — that's what I'm here for! If you need anything else, just ask."
  }

  if (hit(q, ['bye', 'goodbye', 'see you'])) {
    return "See you soon! Whenever you need money advice, I'll be right here in the corner."
  }

  return "I can help you with budgeting, saving, accounts, transfers, transactions, plans and security. For example, try \u201cHow do I set a budget?\u201d or \u201cWhat's my total balance?\u201d"
}