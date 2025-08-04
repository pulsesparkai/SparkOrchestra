import type { Express } from "express";
import Anthropic from '@anthropic-ai/sdk';

export function registerValidateApiKeyRoutes(app: Express) {
  // Validate user-provided API key
  app.post("/api/validate-api-key", async (req, res) => {
    try {
      const { apiKey } = req.body;

      if (!apiKey) {
        return res.status(400).json({ valid: false, error: "API key is required" });
      }

      // Basic format validation
      if (!apiKey.startsWith('sk-ant-')) {
        return res.status(400).json({ 
          valid: false, 
          error: "API key must start with 'sk-ant-'" 
        });
      }

      if (apiKey.length < 20) {
        return res.status(400).json({ 
          valid: false, 
          error: "API key format is invalid" 
        });
      }

      // Test the API key with a minimal request
      const anthropic = new Anthropic({ apiKey });
      
      try {
        // Make a minimal test request to validate the key
        const response = await anthropic.messages.create({
          model: "claude-3-haiku-20240307", // Use cheapest model for validation
          max_tokens: 10,
          messages: [{ role: "user", content: "Hi" }],
        });

        if (response && response.content) {
          return res.json({ 
            valid: true, 
            message: "API key is valid and working" 
          });
        } else {
          return res.status(400).json({ 
            valid: false, 
            error: "API key validation failed" 
          });
        }
      } catch (anthropicError: any) {
        console.error("Anthropic API validation error:", anthropicError);
        
        if (anthropicError.status === 401) {
          return res.status(400).json({ 
            valid: false, 
            error: "API key is invalid or unauthorized" 
          });
        } else if (anthropicError.status === 429) {
          return res.status(400).json({ 
            valid: false, 
            error: "Rate limit exceeded - API key may be valid but limited" 
          });
        } else {
          return res.status(400).json({ 
            valid: false, 
            error: "Failed to validate API key" 
          });
        }
      }
    } catch (error) {
      console.error("API key validation error:", error);
      res.status(500).json({ 
        valid: false, 
        error: "Internal server error during validation" 
      });
    }
  });
}