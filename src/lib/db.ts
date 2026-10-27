import "server-only";
import fs from "fs";
import path from "path";
import { env } from "./env";
import type { User, Swing, Payment, CoachOverride } from "@/types";

/**
 * Data layer.
 *
 * - If Firebase env vars are configured -> FirestoreStore (persistent, cloud).
 * - Otherwise -> LocalStore: an atomic JSON document on disk (data/db.json).
 * Both implement the same Store interface, so the rest of the app never
 * branches on the backend. Swap points for a real DB (Postgres, Mongo) are
 * isolated here.
 */
export interface Store {
  // users
  createUser(u: User): Promise<User>;
  getUserById(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  updateUser(id: string, patch: Partial<User>): Promise<User | null>;
  listUsers(): Promise<User[]>;
  // swings
  createSwing(s: Swing): Promise<Swing>;
  getSwing(id: string): Promise<Swing | null>;
  listSwingsByUser(userId: string): Promise<Swing[]>;
  listAllSwings(): Promise<Swing[]>;
  updateSwing(id: string, patch: Partial<Swing>): Promise<Swing | null>;
  deleteSwing(id: string): Promise<boolean>;
  // payments
  createPayment(p: Payment): Promise<Payment>;
  getPayment(id: string): Promise<Payment | null>;
  listPayments(): Promise<Payment[]>;
  listPaymentsByUser(userId: string): Promise<Payment[]>;
  // coach prompt overrides (admin editable)
  getCoachOverrides(): Promise<Record<string, CoachOverride>>;
  saveCoachOverride(coachId: string, o: CoachOverride): Promise<void>;
}

/* ------------------------------------------------------------------ */
/* Local JSON store (demo mode)                                        */
/* ------------------------------------------------------------------ */

interface LocalData {
  users: User[]; swings: Swing[]; payments: Payment[];
  credentials: Record<string, { hash: string; salt: string }>;
  coachOverrides: Record<string, CoachOverride>;
}

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "db.json");

// Ensure the data directory exists at startup so missing folders never crash.
try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch { /* ignore */ }

function loadLocal(): LocalData {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const defaults: LocalData = { users: [], swings: [], payments: [], credentials: {}, coachOverrides: {} };
    const parsed = JSON.parse(raw) as Partial<LocalData>;
    return { ...defaults, ...parsed };
  } catch {
    return { users: [], swings: [], payments: [], credentials: {}, coachOverrides: {} };
  }
}

let localCache: LocalData | null = null;
let writeChain: Promise<void> = Promise.resolve();

function saveLocal(): Promise<void> {
  writeChain = writeChain.then(() => {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      const tmp = DATA_FILE + ".tmp";
      fs.writeFileSync(tmp, JSON.stringify(localCache, null, 2));
      fs.renameSync(tmp, DATA_FILE);
    } catch (e) {
      // Never crash the Node process on a failed write; log and continue.
      console.error("[db] saveLocal failed:", e);
    }
  });
  return writeChain;
}

class LocalStore implements Store {
  private data(): LocalData {
    if (!localCache) localCache = loadLocal();
    return localCache;
  }
  async createUser(u: User) { this.data().users.push(u); await saveLocal(); return u; }
  async getUserById(id: string) { return this.data().users.find(u => u.id === id) ?? null; }
  async getUserByEmail(email: string) { return this.data().users.find(u => u.email.toLowerCase() === email.toLowerCase()) ?? null; }
  async updateUser(id: string, patch: Partial<User>) {
    const d = this.data(); const i = d.users.findIndex(u => u.id === id);
    if (i < 0) return null; d.users[i] = { ...d.users[i], ...patch }; await saveLocal(); return d.users[i];
  }
  async listUsers() { return [...this.data().users]; }
  async createSwing(s: Swing) { this.data().swings.push(s); await saveLocal(); return s; }
  async getSwing(id: string) { return this.data().swings.find(s => s.id === id) ?? null; }
  async listSwingsByUser(userId: string) {
    return this.data().swings.filter(s => s.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  async listAllSwings() { return [...this.data().swings].sort((a, b) => b.createdAt.localeCompare(a.createdAt)); }
  async updateSwing(id: string, patch: Partial<Swing>) {
    const d = this.data(); const i = d.swings.findIndex(s => s.id === id);
    if (i < 0) return null; d.swings[i] = { ...d.swings[i], ...patch, updatedAt: new Date().toISOString() }; await saveLocal(); return d.swings[i];
  }
  async deleteSwing(id: string) {
    const d = this.data(); const before = d.swings.length;
    d.swings = d.swings.filter(s => s.id !== id);
    await saveLocal(); return d.swings.length < before;
  }
  async createPayment(p: Payment) { this.data().payments.push(p); await saveLocal(); return p; }
  async getPayment(id: string) { return this.data().payments.find(p => p.id === id) ?? null; }
  async listPayments() { return [...this.data().payments].sort((a, b) => b.createdAt.localeCompare(a.createdAt)); }
  async listPaymentsByUser(userId: string) { return this.data().payments.filter(p => p.userId === userId); }
  async getCoachOverrides() { return { ...this.data().coachOverrides }; }
  async saveCoachOverride(coachId: string, o: CoachOverride) {
    const d = this.data(); d.coachOverrides[coachId] = o; await saveLocal();
  }
}

/* ------------------------------------------------------------------ */
/* Firestore store (production)                                        */
/* ------------------------------------------------------------------ */

class FirestoreStore implements Store {
  private db: import("firebase-admin/firestore").Firestore;
  constructor() {
    const admin = require("firebase-admin");
    if (!admin.apps.length) {
      admin.initializeApp({ credential: admin.credential.cert({
        projectId: env.firebase.projectId,
        clientEmail: env.firebase.clientEmail,
        privateKey: env.firebase.privateKey,
      }) });
    }
    this.db = admin.firestore();
  }
  private col<T>(name: string) { return this.db.collection(name); }
  async createUser(u: User) { await this.db.collection("users").doc(u.id).set(u); return u; }
  async getUserById(id: string) { const s = await this.db.collection("users").doc(id).get(); return s.exists ? (s.data() as User) : null; }
  async getUserByEmail(email: string) {
    const q = await this.db.collection("users").where("email", "==", email.toLowerCase()).limit(1).get();
    return q.empty ? null : (q.docs[0].data() as User);
  }
  async updateUser(id: string, patch: Partial<User>) { await this.db.collection("users").doc(id).update(patch); return this.getUserById(id); }
  async listUsers() { const s = await this.db.collection("users").orderBy("createdAt", "desc").get(); return s.docs.map(d => d.data() as User); }
  async createSwing(s: Swing) { await this.db.collection("swings").doc(s.id).set(s); return s; }
  async getSwing(id: string) { const s = await this.db.collection("swings").doc(id).get(); return s.exists ? (s.data() as Swing) : null; }
  async listSwingsByUser(userId: string) { const s = await this.db.collection("swings").where("userId", "==", userId).orderBy("createdAt", "desc").get(); return s.docs.map(d => d.data() as Swing); }
  async listAllSwings() { const s = await this.db.collection("swings").orderBy("createdAt", "desc").get(); return s.docs.map(d => d.data() as Swing); }
  async updateSwing(id: string, patch: Partial<Swing>) { await this.db.collection("swings").doc(id).update({ ...patch, updatedAt: new Date().toISOString() }); return this.getSwing(id); }
  async deleteSwing(id: string) { await this.db.collection("swings").doc(id).delete(); return true; }
  async createPayment(p: Payment) { await this.db.collection("payments").doc(p.id).set(p); return p; }
  async getPayment(id: string) { const s = await this.db.collection("payments").doc(id).get(); return s.exists ? (s.data() as Payment) : null; }
  async listPayments() { const s = await this.db.collection("payments").orderBy("createdAt", "desc").get(); return s.docs.map(d => d.data() as Payment); }
  async listPaymentsByUser(userId: string) { const s = await this.db.collection("payments").where("userId", "==", userId).orderBy("createdAt", "desc").get(); return s.docs.map(d => d.data() as Payment); }
  async getCoachOverrides() {
    const s = await this.db.collection("coachOverrides").get();
    const out: Record<string, CoachOverride> = {};
    s.docs.forEach(d => { out[d.id] = d.data() as CoachOverride; });
    return out;
  }
  async saveCoachOverride(coachId: string, o: CoachOverride) { await this.db.collection("coachOverrides").doc(coachId).set(o); }
}

let store: Store | null = null;
export function getStore(): Store {
  if (!store) store = env.firebase.enabled ? new FirestoreStore() : new LocalStore();
  return store;
}

/* Credentials live outside the public user record. */
export async function saveCredentials(userId: string, hash: string, salt: string): Promise<void> {
  if (store instanceof FirestoreStore) {
    const admin = require("firebase-admin");
    await admin.firestore().collection("credentials").doc(userId).set({ hash, salt });
  } else {
    const d = (localCache ?? loadLocal()); d.credentials[userId] = { hash, salt }; localCache = d; await saveLocal();
  }
}
export async function getCredentials(userId: string): Promise<{ hash: string; salt: string } | null> {
  if (store instanceof FirestoreStore) {
    const admin = require("firebase-admin");
    const s = await admin.firestore().collection("credentials").doc(userId).get();
    return s.exists ? (s.data() as { hash: string; salt: string }) : null;
  }
  const d = localCache ?? loadLocal(); return d.credentials[userId] ?? null;
}
