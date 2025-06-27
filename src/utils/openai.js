import OpenAI from 'openai'

// OpenAI クライアントの初期化
let openaiClient = null

export function initializeOpenAI() {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  
  if (!apiKey) {
    console.warn('OpenAI APIキーが設定されていません。.envファイルにVITE_OPENAI_API_KEY=your_api_keyを追加してください。')
    return null
  }
  
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true // クライアントサイドで使用するため
    })
  }
  
  return openaiClient
}

// 過去のメモから傾向を分析してプロンプトを生成
function analyzeMemoTrends(memos) {
  if (!memos || memos.length === 0) {
    return "新しいユーザーのための"
  }
  
  // メモの内容を分析
  const allMemoTexts = memos.map(memo => memo.memo).join(' ')
  
  // よく使われる単語やテーマを簡単に分析
  const themes = []
  const keywords = [
    { word: '仕事', category: 'work' },
    { word: '人間関係', category: 'relationships' },
    { word: '成長', category: 'growth' },
    { word: '学習', category: 'learning' },
    { word: '健康', category: 'health' },
    { word: '創造', category: 'creativity' },
    { word: '目標', category: 'goals' },
    { word: '価値観', category: 'values' },
    { word: '感情', category: 'emotions' },
    { word: '時間', category: 'time' }
  ]
  
  keywords.forEach(keyword => {
    if (allMemoTexts.includes(keyword.word)) {
      themes.push(keyword.category)
    }
  })
  
  // メモの長さから思考の深さを判断
  const avgLength = allMemoTexts.length / memos.length
  const thinkingDepth = avgLength > 100 ? '深い思考を好む' : 'シンプルな思考を好む'
  
  return {
    themes: themes.length > 0 ? themes : ['general'],
    thinkingDepth,
    memoCount: memos.length,
    recentTopics: memos.slice(0, 3).map(memo => memo.memo.substring(0, 50))
  }
}

// 過去のメモの傾向から新しい質問を生成
export async function generateQuestionFromTrends(memos) {
  const client = initializeOpenAI()
  
  if (!client) {
    throw new Error('OpenAI APIが初期化されていません。APIキーを確認してください。')
  }
  
  const trends = analyzeMemoTrends(memos)
  
  // プロンプトを構築
  let prompt = `あなたは深い思考を促す質問を作成する専門家です。

以下の情報に基づいて、今日の新しい「問い」を1つ生成してください：

ユーザーの傾向:
- 過去のメモ数: ${trends.memoCount}
- 思考の特徴: ${trends.thinkingDepth}
- 関心のあるテーマ: ${trends.themes.join(', ')}`

  if (trends.recentTopics.length > 0) {
    prompt += `
- 最近の思考テーマ: ${trends.recentTopics.join(', ')}`
  }

  prompt += `

要件:
1. 日本語で質問を作成してください
2. 1文または2文程度の短い質問にしてください
3. 深い内省や気づきを促すような質問にしてください
4. 過去の傾向を参考にしつつ、新しい視点を提供してください
5. 「〜について考えてみましょう」のような教師的な表現は避け、「〜だろうか？」「〜とは何か？」のような問いかけの形にしてください

質問:`

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "あなたは深い思考を促す質問を作成する専門家です。ユーザーの思考パターンを分析し、それに基づいて新しい視点を提供する質問を作成します。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 100,
      temperature: 0.8
    })
    
    const generatedQuestion = completion.choices[0]?.message?.content?.trim()
    
    if (!generatedQuestion) {
      throw new Error('質問の生成に失敗しました')
    }
    
    return generatedQuestion
  } catch (error) {
    console.error('OpenAI API エラー:', error)
    throw error
  }
}

// API接続テスト
export async function testOpenAIConnection() {
  const client = initializeOpenAI()
  
  if (!client) {
    return { success: false, error: 'APIキーが設定されていません' }
  }
  
  try {
    const completion = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Hello" }],
      max_tokens: 5
    })
    
    return { success: true, message: '接続成功' }
  } catch (error) {
    return { success: false, error: error.message }
  }
} 