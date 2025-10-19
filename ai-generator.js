class AIProjectGenerator {
    constructor() {
        this.systemPrompt = `You are an expert maker and craftsperson assistant. Your job is to analyze items people have and suggest creative, practical projects they can build. You're helpful, encouraging, and provide detailed, actionable guidance.`;
    }

    async generateProjectIdeas(imageData, context, conversationHistory) {
        const userMessage = {
            role: "user",
            content: this._buildIdeaPrompt(imageData, context)
        };

        try {
            const completion = await websim.chat.completions.create({
                messages: [
                    { role: "system", content: this.systemPrompt },
                    ...conversationHistory.slice(-4),
                    userMessage
                ],
                json: true
            });

            const response = JSON.parse(completion.content);
            return response.projectIdeas || [];
        } catch (error) {
            console.error('Error generating ideas:', error);
            return [];
        }
    }

    async generateDetailedGuide(idea, context, conversationHistory) {
        const userMessage = {
            role: "user",
            content: this._buildGuidePrompt(idea, context)
        };

        try {
            const completion = await websim.chat.completions.create({
                messages: [
                    { role: "system", content: this.systemPrompt + " Provide extremely detailed, step-by-step instructions." },
                    ...conversationHistory.slice(-4),
                    userMessage
                ],
                json: true
            });

            return JSON.parse(completion.content);
        } catch (error) {
            console.error('Error generating guide:', error);
            return {};
        }
    }

    _buildIdeaPrompt(imageData, context) {
        let prompt = `Analyze what can be built with these items. Respond with ONLY valid JSON matching this schema, no other text:
{
  "projectIdeas": [
    {
      "title": "string - creative project name",
      "description": "string - brief description",
      "itemsUsed": "string - list of items from the image/context that would be used",
      "difficulty": "Easy | Medium | Hard",
      "timeEstimate": "string - rough time estimate"
    }
  ]
}

Items available:`;

        if (imageData) {
            prompt += ` [Image showing items]. `;
        }
        if (context) {
            prompt += ` Context: ${context}`;
        }

        prompt += ` Generate 3-4 creative, practical project ideas.`;

        return [{
            type: "text",
            text: prompt
        }];
    }

    _buildGuidePrompt(idea, context) {
        const prompt = `Create a complete, detailed guide for this project:
Project: "${idea.title}"
Description: "${idea.description}"
Available items context: "${context}"

Respond with ONLY valid JSON matching this schema, no other text:
{
  "projectTitle": "string",
  "overview": "string - detailed project overview",
  "materialsNeeded": ["string array - complete list"],
  "timeRequired": "string",
  "steps": [
    {
      "title": "string",
      "description": "string - detailed step description"
    }
  ],
  "tips": ["string array - helpful tips"],
  "blueprint": true
}`;

        return [{
            type: "text",
            text: prompt
        }];
    }
}

export default AIProjectGenerator;

