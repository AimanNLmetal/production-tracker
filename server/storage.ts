import {
  users,
  productionEntries,
  productionDetails,
  instructions,
  type User,
  type InsertUser,
  type ProductionEntry,
  type InsertProductionEntry,
  type ProductionDetail,
  type InsertProductionDetail,
  type Instruction,
  type InsertInstruction,
  type ProductionEntryWithDetails,
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Production entry operations
  createProductionEntry(entry: InsertProductionEntry): Promise<ProductionEntry>;
  addProductionDetail(detail: InsertProductionDetail): Promise<ProductionDetail>;
  getProductionEntries(filters?: {
    userId?: number;
    process?: string;
    station?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<ProductionEntryWithDetails[]>;
  getProductionEntryById(id: number): Promise<ProductionEntryWithDetails | undefined>;
  
  // Instruction operations
  createInstruction(instruction: InsertInstruction): Promise<Instruction>;
  getInstructions(filters?: {
    targetProcess?: string;
    targetStation?: string;
  }): Promise<Instruction[]>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private productionEntries: Map<number, ProductionEntry>;
  private productionDetails: Map<number, ProductionDetail[]>;
  private instructions: Map<number, Instruction>;
  
  private userIdCounter: number;
  private entryIdCounter: number;
  private detailIdCounter: number;
  private instructionIdCounter: number;

  constructor() {
    this.users = new Map();
    this.productionEntries = new Map();
    this.productionDetails = new Map();
    this.instructions = new Map();
    
    this.userIdCounter = 1;
    this.entryIdCounter = 1;
    this.detailIdCounter = 1;
    this.instructionIdCounter = 1;
    
    // Initialize with test users
    this.seedUsers();
  }

  private seedUsers() {
    // Create an operator user
    this.createUser({
      username: "operator",
      password: "password", // In a real app, this would be hashed
      name: "John Operator",
      role: "operator",
      operatorId: "12275"
    });
    
    // Create a management user
    this.createUser({
      username: "manager",
      password: "password", // In a real app, this would be hashed
      name: "Jane Manager",
      role: "management"
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Production entry operations
  async createProductionEntry(insertEntry: InsertProductionEntry): Promise<ProductionEntry> {
    const id = this.entryIdCounter++;
    const now = new Date();
    const entry: ProductionEntry = { ...insertEntry, id, createdAt: now };
    this.productionEntries.set(id, entry);
    this.productionDetails.set(id, []);
    return entry;
  }

  async addProductionDetail(insertDetail: InsertProductionDetail): Promise<ProductionDetail> {
    const id = this.detailIdCounter++;
    const detail: ProductionDetail = { ...insertDetail, id };
    
    const entryDetails = this.productionDetails.get(insertDetail.entryId) || [];
    entryDetails.push(detail);
    this.productionDetails.set(insertDetail.entryId, entryDetails);
    
    return detail;
  }

  async getProductionEntries(filters?: {
    userId?: number;
    process?: string;
    station?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<ProductionEntryWithDetails[]> {
    const entries = Array.from(this.productionEntries.values());
    
    // Apply filters if provided
    let filteredEntries = entries;
    if (filters) {
      filteredEntries = entries.filter(entry => {
        if (filters.userId !== undefined && entry.userId !== filters.userId) return false;
        if (filters.process && entry.process !== filters.process) return false;
        if (filters.station && entry.station !== filters.station) return false;
        if (filters.startDate && entry.createdAt < filters.startDate) return false;
        if (filters.endDate && entry.createdAt > filters.endDate) return false;
        return true;
      });
    }
    
    // Transform to include details
    return filteredEntries.map(entry => {
      const details = this.productionDetails.get(entry.id) || [];
      return { ...entry, details };
    });
  }

  async getProductionEntryById(id: number): Promise<ProductionEntryWithDetails | undefined> {
    const entry = this.productionEntries.get(id);
    if (!entry) return undefined;
    
    const details = this.productionDetails.get(id) || [];
    return { ...entry, details };
  }

  // Instruction operations
  async createInstruction(insertInstruction: InsertInstruction): Promise<Instruction> {
    const id = this.instructionIdCounter++;
    const now = new Date();
    const instruction: Instruction = { ...insertInstruction, id, createdAt: now };
    this.instructions.set(id, instruction);
    return instruction;
  }

  async getInstructions(filters?: {
    targetProcess?: string;
    targetStation?: string;
  }): Promise<Instruction[]> {
    const allInstructions = Array.from(this.instructions.values());
    
    // Apply filters if provided
    if (!filters) return allInstructions;
    
    return allInstructions.filter(instruction => {
      if (filters.targetProcess && 
          filters.targetProcess !== "All Processes" && 
          instruction.targetProcess !== filters.targetProcess && 
          instruction.targetProcess !== "All Processes") return false;
      
      if (filters.targetStation && 
          filters.targetStation !== "All Stations" && 
          instruction.targetStation !== filters.targetStation && 
          instruction.targetStation !== "All Stations") return false;
      
      return true;
    }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Sort by createdAt desc
  }
}

export const storage = new MemStorage();
