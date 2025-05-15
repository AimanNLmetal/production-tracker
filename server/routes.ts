import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertProductionEntrySchema, 
  insertProductionDetailSchema,
  insertInstructionSchema,
  processes,
  models,
  times,
  stationsByProcess
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // In a real app, we'd set up proper session management
      // For now, just return the user data (except password)
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Server error during login" });
    }
  });

  // User routes
  app.get("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Server error fetching user" });
    }
  });

  // Reference data routes
  app.get("/api/reference-data", (req: Request, res: Response) => {
    res.json({
      processes,
      models,
      times,
      stationsByProcess,
    });
  });

  // Production entry routes
  app.post("/api/production", async (req: Request, res: Response) => {
    try {
      const result = insertProductionEntrySchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid production entry data", errors: result.error.format() });
      }
      
      const entry = await storage.createProductionEntry(result.data);
      res.status(201).json(entry);
    } catch (error) {
      res.status(500).json({ message: "Server error creating production entry" });
    }
  });

  // Production detail routes
  app.post("/api/production/:entryId/details", async (req: Request, res: Response) => {
    try {
      const entryId = parseInt(req.params.entryId);
      
      const entry = await storage.getProductionEntryById(entryId);
      if (!entry) {
        return res.status(404).json({ message: "Production entry not found" });
      }
      
      const detailWithEntryId = { ...req.body, entryId };
      const result = insertProductionDetailSchema.safeParse(detailWithEntryId);
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid production detail data", errors: result.error.format() });
      }
      
      const detail = await storage.addProductionDetail(result.data);
      res.status(201).json(detail);
    } catch (error) {
      res.status(500).json({ message: "Server error adding production detail" });
    }
  });

  // Get production entries with optional filtering
  app.get("/api/production", async (req: Request, res: Response) => {
    try {
      const filters: {
        userId?: number;
        process?: string;
        station?: string;
        startDate?: Date;
        endDate?: Date;
      } = {};
      
      if (req.query.userId) {
        filters.userId = parseInt(req.query.userId as string);
      }
      
      if (req.query.process) {
        filters.process = req.query.process as string;
      }
      
      if (req.query.station) {
        filters.station = req.query.station as string;
      }
      
      if (req.query.startDate) {
        filters.startDate = new Date(req.query.startDate as string);
      }
      
      if (req.query.endDate) {
        filters.endDate = new Date(req.query.endDate as string);
      }
      
      const entries = await storage.getProductionEntries(filters);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Server error fetching production entries" });
    }
  });

  // Get specific production entry
  app.get("/api/production/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const entry = await storage.getProductionEntryById(id);
      
      if (!entry) {
        return res.status(404).json({ message: "Production entry not found" });
      }
      
      res.json(entry);
    } catch (error) {
      res.status(500).json({ message: "Server error fetching production entry" });
    }
  });

  // Instruction routes
  app.post("/api/instructions", async (req: Request, res: Response) => {
    try {
      const result = insertInstructionSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid instruction data", errors: result.error.format() });
      }
      
      const instruction = await storage.createInstruction(result.data);
      res.status(201).json(instruction);
    } catch (error) {
      res.status(500).json({ message: "Server error creating instruction" });
    }
  });

  // Get instructions with optional filtering
  app.get("/api/instructions", async (req: Request, res: Response) => {
    try {
      const filters: {
        targetProcess?: string;
        targetStation?: string;
      } = {};
      
      if (req.query.targetProcess) {
        filters.targetProcess = req.query.targetProcess as string;
      }
      
      if (req.query.targetStation) {
        filters.targetStation = req.query.targetStation as string;
      }
      
      const instructions = await storage.getInstructions(filters);
      res.json(instructions);
    } catch (error) {
      res.status(500).json({ message: "Server error fetching instructions" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
