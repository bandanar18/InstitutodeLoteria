import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
const scrypt=promisify(scryptCallback);
export const dataDir=resolve(process.env.PORTAL_DATA_DIR || 'data');
mkdirSync(resolve(dataDir,'documents'),{recursive:true});
export const db=new DatabaseSync(resolve(dataDir,'portal.sqlite'));
db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,name TEXT NOT NULL,email TEXT UNIQUE NOT NULL,password TEXT NOT NULL,role TEXT NOT NULL DEFAULT 'applicant',created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),expires INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS applications(id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),category TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'draft',details TEXT NOT NULL DEFAULT '{}',version TEXT NOT NULL,created_at TEXT NOT NULL,updated_at TEXT NOT NULL,submitted_at TEXT);
CREATE TABLE IF NOT EXISTS documents(id TEXT PRIMARY KEY,application_id TEXT NOT NULL REFERENCES applications(id),requirement_id TEXT NOT NULL,filename TEXT,path TEXT,mime TEXT,size INTEGER,expires TEXT,waiver TEXT,status TEXT NOT NULL DEFAULT 'pending',comment TEXT NOT NULL DEFAULT '',updated_at TEXT NOT NULL,UNIQUE(application_id,requirement_id));
CREATE TABLE IF NOT EXISTS events(id INTEGER PRIMARY KEY AUTOINCREMENT,application_id TEXT NOT NULL REFERENCES applications(id),actor_id TEXT NOT NULL REFERENCES users(id),message TEXT NOT NULL,created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS payments(id TEXT PRIMARY KEY,application_id TEXT NOT NULL REFERENCES applications(id),document_id TEXT NOT NULL REFERENCES documents(id),purpose TEXT NOT NULL,reference TEXT NOT NULL,amount REAL NOT NULL,date TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'pending',comment TEXT NOT NULL DEFAULT '',created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS settings(id INTEGER PRIMARY KEY CHECK(id=1),value TEXT NOT NULL);
INSERT OR IGNORE INTO settings(id,value) VALUES(1,'{"rate":null,"rateDate":"","rateSource":"","stamp":null}');`);
export const now=()=>new Date().toISOString();
export async function hashPassword(password){const salt=randomBytes(16).toString('hex');const hash=await scrypt(password,salt,64);return `${salt}:${hash.toString('hex')}`;}
export async function checkPassword(password,stored){const [salt,hex]=stored.split(':');const hash=await scrypt(password,salt,64);return timingSafeEqual(hash,Buffer.from(hex,'hex'));}
export function event(applicationId,actorId,message){db.prepare('INSERT INTO events(application_id,actor_id,message,created_at) VALUES(?,?,?,?)').run(applicationId,actorId,message,now());}
export function settings(){return JSON.parse(db.prepare('SELECT value FROM settings WHERE id=1').get().value);}
