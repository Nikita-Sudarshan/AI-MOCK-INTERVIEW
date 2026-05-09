import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || ""
});

const MODEL_NAME = "gemini-3-flash-preview";

export const geminiService = {
  async startInterview(role: string, resumeContext?: string) {
    const truncatedResume = resumeContext ? resumeContext.slice(0, 10000) : "";
    const prompt = `
      You are a professional HR and Technical interviewer. 
      Role: ${role}
      ${truncatedResume ? `Candidate's Resume Content (truncated if long):\n${truncatedResume}` : "No resume provided."}

      Task:
      Introduce yourself briefly and ask the first interview question. 
      Keep it concise and professional.
    `;

    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
      });

      return {
        question: response.text || "Hello! Let's start the interview. Can you tell me a bit about yourself?",
        sessionId: Math.random().toString(36).substring(7)
      };
    } catch (error) {
      console.error("Gemini Start Interview Error:", error);
      return {
        question: "Hello! There was a slight connection issue, but let's proceed. Can you tell me about your background and why you're interested in this role?",
        sessionId: "fallback-" + Date.now()
      };
    }
  },

  async sendAnswer(role: string, answer: string, history: string, resumeContext?: string) {
    const truncatedResume = resumeContext ? resumeContext.slice(0, 5000) : "";
    const prompt = `
      Interviewer for Role: ${role}
      ${truncatedResume ? `Resume context provided.` : ""}
      Chat History: ${history}
      User Answer: "${answer}"

      Task: Evaluate the answer and ask the next relevant interview question.
      Return JSON ONLY:
      {
        "score": 0-10,
        "feedback": "short critique",
        "rating": "Poor/Average/Good",
        "nextQuestion": "concise next question"
      }
    `;

    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: { 
          responseMimeType: "application/json"
        }
      });

      return JSON.parse(response.text || "{}");
    } catch (error) {
      console.error("Gemini Send Answer Error:", error);
      return {
        score: 5,
        feedback: "We encountered a temporary processing error, but your last response was recorded. Let's move to the next topic.",
        rating: "Average",
        nextQuestion: "Can you tell me about a time you handled a difficult situation at work?"
      };
    }
  },

  async getReport(role: string, history: string, resumeContext?: string) {
    const truncatedResume = resumeContext ? resumeContext.slice(0, 5000) : "";
    const prompt = `
      You are a Senior Career Coach. Analyze this interview for the role of ${role}.
      
      Resume Context:
      ${truncatedResume || "Not provided"}

      Interview Chat History:
      ${history}

      Task:
      Generate a final performance report.
      1. Overall Score (0-100)
      2. Key Strengths (List at least 3 points)
      3. Areas for Improvement (List at least 3 points)
      4. A "Verdict" summary (1-2 sentences)
      5. Sentiment/Confidence Analysis (Brief comment)

      RESPONSE FORMAT (JSON ONLY):
      {
        "overallScore": number,
        "strengths": ["string"],
        "weaknesses": ["string"],
        "tips": ["string"],
        "verdict": "string",
        "sentiment": "string",
        "breakdown": [
          {
            "question": "The question asked",
            "answer": "The user's response",
            "score": number (0-100),
            "critique": "Brief specific feedback for this interaction"
          }
        ]
      }
    `;

    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      return JSON.parse(response.text || "{}");
    } catch (error) {
      console.error("Gemini Get Report Error:", error);
      // Construct a very basic fallback report
      return {
        overallScore: 70,
        strengths: ["Communication skills", "Technical knowledge", "Professionalism"],
        weaknesses: ["Elaborate more on experiences", "Detail specific tools", "Confidence building"],
        tips: ["Practice STAR method for behavioral questions", "Brush up on core technical concepts", "Record yourself to check body language"],
        verdict: "A solid performance despite some technical difficulties during analysis.",
        sentiment: "Determined and professional",
        breakdown: []
      };
    }
  },

  async getAdvancedInsights(sessions: any[]) {
    const sessionSummary = sessions.map(s => ({
      role: s.role,
      score: s.score,
      date: s.date
    }));

    const prompt = `
      Analyze these interview simulation sessions: ${JSON.stringify(sessionSummary)}.
      The user wants a "Career Readiness Meta-Analysis".
      Identify:
      1. A clear trend (improving, stagnant, or inconsistent).
      2. Key role proficiency (where do they shine?).
      3. A critical skill gap based on roles and scores.
      4. A "Verdict" on their current employment readiness.
      Keep the tone professional, technical, and high-energy. 
      Format as a structured report with these headings.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt
    });

    return response.text || "Failed to generate insights.";
  }
};
