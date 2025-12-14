import { type Document, type InsertDocument } from "@shared/schema";
import { randomUUID } from "crypto";
import mongoose from "mongoose";
import { log } from "./app";

export interface IStorage {
  getDocument(id: string): Promise<Document | undefined>;
  getDocuments(): Promise<Document[]>;
  createDocument(doc: InsertDocument): Promise<Document>;
  updateDocument(id: string, doc: Partial<InsertDocument>): Promise<Document | undefined>;
  deleteDocument(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private documents: Map<string, Document>;

  constructor() {
    this.documents = new Map();
  }

  async getDocument(id: string): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async getDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async createDocument(insertDoc: InsertDocument): Promise<Document> {
    const id = randomUUID();
    const now = new Date().toISOString();
    const doc: Document = {
      id,
      ...insertDoc,
      createdAt: now,
      updatedAt: now,
    };
    this.documents.set(id, doc);
    return doc;
  }

  async updateDocument(id: string, updateDoc: Partial<InsertDocument>): Promise<Document | undefined> {
    const existing = this.documents.get(id);
    if (!existing) return undefined;

    const updated: Document = {
      ...existing,
      ...updateDoc,
      updatedAt: new Date().toISOString(),
    };
    this.documents.set(id, updated);
    return updated;
  }

  async deleteDocument(id: string): Promise<boolean> {
    return this.documents.delete(id);
  }
}

// Mongo-backed storage implementation using mongoose
export class MongoStorage implements IStorage {
  private model: mongoose.Model<any>;

  constructor() {
    const schema = new mongoose.Schema({
      id: { type: String, required: true, unique: true },
      title: { type: String, required: true },
      content: { type: String, required: true },
      savePath: { type: String, required: false },
      createdAt: { type: String, required: true },
      updatedAt: { type: String, required: true },
    });

    // Avoid model overwrite in hot-reload environments
    this.model = (mongoose.models.Document as mongoose.Model<any>) || mongoose.model('Document', schema);
  }

  async getDocument(id: string): Promise<Document | undefined> {
    if (!id) return undefined;
    const found = await this.model.findOne({ id }).lean().exec();
    return found as unknown as Document | undefined;
  }

  async getDocuments(): Promise<Document[]> {
    const docs = await this.model.find({}).sort({ updatedAt: -1 }).lean().exec();
    return docs as unknown as Document[];
  }

  async createDocument(insertDoc: InsertDocument): Promise<Document> {
    const id = randomUUID();
    const now = new Date().toISOString();
    const doc = {
      id,
      ...insertDoc,
      createdAt: now,
      updatedAt: now,
    };
    const created = await this.model.create(doc);
    return created.toObject() as Document;
  }

  async updateDocument(id: string, updateDoc: Partial<InsertDocument>): Promise<Document | undefined> {
    const now = new Date().toISOString();
    const toUpdate: any = { ...updateDoc, updatedAt: now };
    const updated = await this.model.findOneAndUpdate({ id }, toUpdate, { new: true }).lean().exec();
    return updated as unknown as Document | undefined;
  }

  async deleteDocument(id: string): Promise<boolean> {
    const res = await this.model.deleteOne({ id }).exec();
    return res.deletedCount && res.deletedCount > 0 ? true : false;
  }
}

// Choose storage implementation based on environment.
// When ENABLE_PERSISTENCE is set to true and a MONGO_URI exists, use MongoStorage; otherwise fallback to MemStorage
const useMongo = process.env.ENABLE_PERSISTENCE === 'true' && !!process.env.MONGO_URI;
if (useMongo) log('Using MongoStorage (persistence enabled)');
else log('Using MemStorage (in-memory), set ENABLE_PERSISTENCE=true and MONGO_URI to use MongoDB');

export const storage: IStorage = useMongo ? new MongoStorage() : new MemStorage();
