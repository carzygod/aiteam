/**
 * Dev³ API Routes
 * 
 * RESTful API endpoints for the Dev³ multi-AI decision-making system.
 * All routes are prefixed with /api and handle JSON request/response.
 * 
 * @module routes
 */

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertDecisionSchema,
  updateDecisionSchema,
  insertAIResponseSchema,
  AI_MODELS,
  AI_MODEL_ROLES,
} from "@shared/schema";
import { z } from "zod";

/**
 * Registers all API routes for the Dev³ application
 * 
 * @param httpServer - The HTTP server instance
 * @param app - The Express application instance
 * @returns The configured HTTP server
 * 
 * @example
 * ```typescript
 * const httpServer = createServer(app);
 * await registerRoutes(httpServer, app);
 * ```
 */
export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  /**
   * GET /api/models
   * Returns information about the three AI models and their roles
   */
  app.get("/api/models", async (_req, res) => {
    res.json({
      models: AI_MODELS,
      roles: AI_MODEL_ROLES,
    });
  });

  /**
   * POST /api/decisions
   * Creates a new decision request for the AI trinity to deliberate
   * 
   * @body {InsertDecision} - Decision data (title, description, category, priority)
   * @returns {Decision} - The created decision with generated ID
   */
  app.post("/api/decisions", async (req, res) => {
    try {
      const validatedData = insertDecisionSchema.parse(req.body);
      const decision = await storage.createDecision(validatedData);
      res.status(201).json(decision);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          error: "Validation failed", 
          details: error.errors 
        });
      } else {
        console.error("Error creating decision:", error);
        res.status(500).json({ error: "Failed to create decision" });
      }
    }
  });

  /**
   * GET /api/decisions
   * Retrieves all decisions, sorted by creation date (newest first)
   * 
   * @returns {Decision[]} - Array of all decisions with responses and consensus
   */
  app.get("/api/decisions", async (_req, res) => {
    try {
      const decisions = await storage.getAllDecisions();
      res.json(decisions);
    } catch (error) {
      console.error("Error fetching decisions:", error);
      res.status(500).json({ error: "Failed to fetch decisions" });
    }
  });

  /**
   * GET /api/decisions/:id
   * Retrieves a single decision by ID
   * 
   * @param id - The decision ID
   * @returns {Decision} - The decision with all responses and consensus
   */
  app.get("/api/decisions/:id", async (req, res) => {
    try {
      const decision = await storage.getDecision(req.params.id);
      if (!decision) {
        res.status(404).json({ error: "Decision not found" });
        return;
      }
      res.json(decision);
    } catch (error) {
      console.error("Error fetching decision:", error);
      res.status(500).json({ error: "Failed to fetch decision" });
    }
  });

  /**
   * PATCH /api/decisions/:id
   * Updates an existing decision
   * 
   * @param id - The decision ID
   * @body {UpdateDecision} - Partial decision data to update
   * @returns {Decision} - The updated decision
   */
  app.patch("/api/decisions/:id", async (req, res) => {
    try {
      const validatedData = updateDecisionSchema.parse(req.body);
      const decision = await storage.updateDecision(req.params.id, validatedData);
      if (!decision) {
        res.status(404).json({ error: "Decision not found" });
        return;
      }
      res.json(decision);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          error: "Validation failed", 
          details: error.errors 
        });
      } else {
        console.error("Error updating decision:", error);
        res.status(500).json({ error: "Failed to update decision" });
      }
    }
  });

  /**
   * DELETE /api/decisions/:id
   * Deletes a decision and all associated data
   * 
   * @param id - The decision ID
   * @returns 204 No Content on success
   */
  app.delete("/api/decisions/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteDecision(req.params.id);
      if (!deleted) {
        res.status(404).json({ error: "Decision not found" });
        return;
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting decision:", error);
      res.status(500).json({ error: "Failed to delete decision" });
    }
  });

  /**
   * POST /api/decisions/:id/responses
   * Adds an AI model's response to a decision
   * Replaces any existing response from the same model
   * 
   * @param id - The decision ID
   * @body {InsertAIResponse} - The AI response (model, vote, reasoning, confidence, etc.)
   * @returns {AIResponse} - The created response
   */
  app.post("/api/decisions/:id/responses", async (req, res) => {
    try {
      const decision = await storage.getDecision(req.params.id);
      if (!decision) {
        res.status(404).json({ error: "Decision not found" });
        return;
      }

      const validatedData = insertAIResponseSchema.parse({
        ...req.body,
        decisionId: req.params.id,
      });
      
      const response = await storage.addAIResponse(validatedData);
      res.status(201).json(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          error: "Validation failed", 
          details: error.errors 
        });
      } else {
        console.error("Error adding AI response:", error);
        res.status(500).json({ error: "Failed to add AI response" });
      }
    }
  });

  /**
   * GET /api/decisions/:id/responses
   * Gets all AI responses for a decision
   * 
   * @param id - The decision ID
   * @returns {AIResponse[]} - Array of AI responses
   */
  app.get("/api/decisions/:id/responses", async (req, res) => {
    try {
      const decision = await storage.getDecision(req.params.id);
      if (!decision) {
        res.status(404).json({ error: "Decision not found" });
        return;
      }
      
      const responses = await storage.getAIResponses(req.params.id);
      res.json(responses);
    } catch (error) {
      console.error("Error fetching AI responses:", error);
      res.status(500).json({ error: "Failed to fetch AI responses" });
    }
  });

  /**
   * POST /api/decisions/:id/consensus
   * Calculates and sets the consensus for a decision
   * Requires all three AI models to have responded
   * 
   * Consensus rules:
   * - 2+ approve votes = approved
   * - 2+ reject votes = rejected
   * - Otherwise = needs_revision
   * 
   * @param id - The decision ID
   * @returns {Consensus} - The calculated consensus with synthesized reasoning
   */
  app.post("/api/decisions/:id/consensus", async (req, res) => {
    try {
      const decision = await storage.getDecision(req.params.id);
      if (!decision) {
        res.status(404).json({ error: "Decision not found" });
        return;
      }

      const responses = await storage.getAIResponses(req.params.id);
      
      // Verify all three models have responded
      const hasAllResponses = AI_MODELS.every(model =>
        responses.some(r => r.model === model)
      );
      
      if (!hasAllResponses) {
        res.status(400).json({ 
          error: "Cannot reach consensus", 
          message: "All three AI models must respond before consensus can be reached",
          responded: responses.map(r => r.model),
          missing: AI_MODELS.filter(m => !responses.some(r => r.model === m)),
        });
        return;
      }

      // Calculate vote summary
      const voteSummary = {
        approve: responses.filter(r => r.vote === "approve").length,
        reject: responses.filter(r => r.vote === "reject").length,
        abstain: responses.filter(r => r.vote === "abstain").length,
      };

      // Determine outcome based on majority
      let outcome: "approved" | "rejected" | "needs_revision";
      if (voteSummary.approve >= 2) {
        outcome = "approved";
      } else if (voteSummary.reject >= 2) {
        outcome = "rejected";
      } else {
        outcome = "needs_revision";
      }

      // Check for unanimity
      const unanimity = voteSummary.approve === 3 || voteSummary.reject === 3;

      // Synthesize reasoning from all models
      const reasonings = responses.map(r => 
        `${AI_MODEL_ROLES[r.model].name} (${r.vote}, ${r.confidence}% confidence): ${r.reasoning}`
      );
      const synthesizedReasoning = reasonings.join("\n\n");

      // Merge all recommendations into unique action items
      const allActionItems = responses.flatMap(r => r.recommendations || []);
      const uniqueActionItems = Array.from(new Set(allActionItems));

      const consensus = await storage.setConsensus(req.params.id, {
        outcome,
        unanimity,
        voteSummary,
        synthesizedReasoning,
        actionItems: uniqueActionItems.length > 0 ? uniqueActionItems : undefined,
      });

      res.status(201).json(consensus);
    } catch (error) {
      console.error("Error reaching consensus:", error);
      res.status(500).json({ error: "Failed to reach consensus" });
    }
  });

  /**
   * GET /api/decisions/:id/consensus
   * Gets the consensus for a decision if one has been reached
   * 
   * @param id - The decision ID
   * @returns {Consensus} - The consensus data
   */
  app.get("/api/decisions/:id/consensus", async (req, res) => {
    try {
      const decision = await storage.getDecision(req.params.id);
      if (!decision) {
        res.status(404).json({ error: "Decision not found" });
        return;
      }
      
      const consensus = await storage.getConsensus(req.params.id);
      if (!consensus) {
        res.status(404).json({ error: "No consensus reached yet" });
        return;
      }
      
      res.json(consensus);
    } catch (error) {
      console.error("Error fetching consensus:", error);
      res.status(500).json({ error: "Failed to fetch consensus" });
    }
  });

  /**
   * GET /api/stats
   * Returns aggregated statistics about all decisions
   * 
   * @returns {object} Statistics including:
   *   - totalDecisions: Total number of decisions
   *   - byStatus: Count by status (pending, deliberating, etc.)
   *   - byCategory: Count by category (feature, security, etc.)
   *   - byPriority: Count by priority (low, medium, high, critical)
   *   - consensusOutcomes: Count of approved/rejected/needs_revision
   *   - unanimousDecisions: Number of unanimous decisions
   */
  app.get("/api/stats", async (_req, res) => {
    try {
      const decisions = await storage.getAllDecisions();
      
      const stats = {
        totalDecisions: decisions.length,
        byStatus: {
          pending: decisions.filter(d => d.status === "pending").length,
          deliberating: decisions.filter(d => d.status === "deliberating").length,
          consensus_reached: decisions.filter(d => d.status === "consensus_reached").length,
          deadlock: decisions.filter(d => d.status === "deadlock").length,
        },
        byCategory: {} as Record<string, number>,
        byPriority: {} as Record<string, number>,
        consensusOutcomes: {
          approved: 0,
          rejected: 0,
          needs_revision: 0,
        },
        unanimousDecisions: 0,
      };

      for (const decision of decisions) {
        // Count by category
        stats.byCategory[decision.category] = (stats.byCategory[decision.category] || 0) + 1;
        
        // Count by priority
        stats.byPriority[decision.priority] = (stats.byPriority[decision.priority] || 0) + 1;
        
        // Count consensus outcomes
        if (decision.consensus) {
          stats.consensusOutcomes[decision.consensus.outcome]++;
          if (decision.consensus.unanimity) {
            stats.unanimousDecisions++;
          }
        }
      }

      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  /**
   * GET /api/health
   * Health check endpoint for monitoring
   * 
   * @returns {object} Health status with timestamp
   */
  app.get("/api/health", async (_req, res) => {
    res.json({
      status: "healthy",
      service: "dev3-api",
      timestamp: new Date().toISOString(),
    });
  });

  return httpServer;
}
