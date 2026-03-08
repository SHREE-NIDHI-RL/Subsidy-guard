import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

export function setupDatabase() {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS farmers (
        aadhaar TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        land_size REAL NOT NULL,
        crop TEXT NOT NULL,
        district TEXT NOT NULL,
        soil_card_id TEXT NOT NULL
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS soil_cards (
        soil_card_id TEXT PRIMARY KEY,
        nitrogen_level TEXT NOT NULL,
        phosphorus_level TEXT NOT NULL,
        potassium_level TEXT NOT NULL,
        recommended_urea_per_acre REAL NOT NULL
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        aadhaar TEXT NOT NULL,
        aadhaar_id TEXT,
        retailer_id TEXT DEFAULT 'RET001',
        fertilizer_type TEXT NOT NULL,
        quantity REAL NOT NULL,
        date DATETIME DEFAULT CURRENT_TIMESTAMP,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT NOT NULL,
        reason TEXT
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS retailers (
        retailer_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        location TEXT NOT NULL
      )
    `);

    seedData();
  });
}

function seedData() {
  db.get("SELECT COUNT(*) as count FROM farmers", (err, row) => {
    if (err) return console.error(err);
    if (row.count === 0) {
      console.log("Seeding database with initial data...");
      
      const farmers = [
        ["123456789012", "Ravi Kumar", 1, "Wheat", "Salem", "SHC102"],
        ["234567890123", "Amit Singh", 5, "Rice", "Thanjavur", "SHC103"],
        ["345678901234", "Suresh Patel", 2.5, "Cotton", "Coimbatore", "SHC104"],
        ["456789012345", "Rajesh Sharma", 3, "Wheat", "Salem", "SHC105"],
        ["567890123456", "Vijay Reddy", 4.5, "Rice", "Thanjavur", "SHC106"],
        ["678901234567", "Prakash Rao", 1.5, "Maize", "Erode", "SHC107"],
        ["789012345678", "Kiran Kumar", 6, "Sugarcane", "Coimbatore", "SHC108"],
        ["890123456789", "Mohan Das", 2, "Wheat", "Salem", "SHC109"],
        ["901234567890", "Anil Verma", 3.5, "Rice", "Thanjavur", "SHC110"],
        ["012345678901", "Deepak Joshi", 1.2, "Cotton", "Coimbatore", "SHC111"],
        ["112345678901", "Ganesh Iyer", 4, "Wheat", "Salem", "SHC112"],
        ["212345678902", "Harish Nair", 2.8, "Rice", "Thanjavur", "SHC113"],
        ["312345678903", "Jagdish Yadav", 5.5, "Maize", "Erode", "SHC114"],
        ["412345678904", "Krishna Pillai", 1.8, "Wheat", "Salem", "SHC115"],
        ["512345678905", "Lakshman Rao", 3.2, "Rice", "Thanjavur", "SHC116"],
        ["612345678906", "Mahesh Gupta", 2.3, "Cotton", "Coimbatore", "SHC117"],
        ["712345678907", "Naveen Kumar", 4.7, "Sugarcane", "Erode", "SHC118"],
        ["812345678908", "Omkar Patil", 1.6, "Wheat", "Salem", "SHC119"],
        ["912345678909", "Pavan Singh", 5.2, "Rice", "Thanjavur", "SHC120"],
        ["102345678910", "Ramesh Babu", 2.9, "Maize", "Erode", "SHC121"],
        ["202345678911", "Sanjay Mehta", 3.8, "Wheat", "Salem", "SHC122"],
        ["302345678912", "Tarun Desai", 1.4, "Cotton", "Coimbatore", "SHC123"],
        ["402345678913", "Uday Shankar", 6.5, "Rice", "Thanjavur", "SHC124"],
        ["502345678914", "Vinod Kulkarni", 2.1, "Wheat", "Salem", "SHC125"],
        ["602345678915", "Yash Agarwal", 4.3, "Sugarcane", "Coimbatore", "SHC126"],
        ["702345678916", "Ashok Tiwari", 1.9, "Maize", "Erode", "SHC127"],
        ["802345678917", "Bharat Jain", 3.6, "Rice", "Thanjavur", "SHC128"],
        ["902345678918", "Chetan Rao", 5.8, "Wheat", "Salem", "SHC129"],
        ["103345678919", "Dinesh Pandey", 2.4, "Cotton", "Coimbatore", "SHC130"],
        ["203345678920", "Eshan Kumar", 4.1, "Rice", "Thanjavur", "SHC131"],
        ["303345678921", "Firoz Khan", 1.7, "Wheat", "Salem", "SHC132"],
        ["403345678922", "Gopal Reddy", 3.3, "Maize", "Erode", "SHC133"],
        ["503345678923", "Hari Prasad", 5.1, "Sugarcane", "Coimbatore", "SHC134"],
        ["603345678924", "Irfan Ali", 2.6, "Rice", "Thanjavur", "SHC135"],
        ["703345678925", "Jatin Sharma", 4.4, "Wheat", "Salem", "SHC136"],
        ["803345678926", "Karthik Menon", 1.3, "Cotton", "Coimbatore", "SHC137"],
        ["903345678927", "Lalit Singh", 6.2, "Rice", "Thanjavur", "SHC138"],
        ["104345678928", "Manish Gupta", 3.7, "Wheat", "Salem", "SHC139"],
        ["204345678929", "Nitin Verma", 2.2, "Maize", "Erode", "SHC140"]
      ];

      const soilCards = [
        ["SHC102", "High", "Medium", "Low", 4],
        ["SHC103", "Medium", "High", "Medium", 5],
        ["SHC104", "Low", "Medium", "High", 3],
        ["SHC105", "High", "Low", "Medium", 4],
        ["SHC106", "Medium", "Medium", "High", 5],
        ["SHC107", "High", "High", "Low", 3],
        ["SHC108", "Low", "Medium", "Medium", 6],
        ["SHC109", "Medium", "High", "Low", 4],
        ["SHC110", "High", "Medium", "High", 5],
        ["SHC111", "Low", "Low", "Medium", 3],
        ["SHC112", "Medium", "High", "High", 4],
        ["SHC113", "High", "Medium", "Low", 5],
        ["SHC114", "Medium", "Low", "Medium", 3],
        ["SHC115", "Low", "High", "High", 4],
        ["SHC116", "High", "Medium", "Medium", 5],
        ["SHC117", "Medium", "High", "Low", 3],
        ["SHC118", "Low", "Medium", "High", 6],
        ["SHC119", "High", "Low", "Medium", 4],
        ["SHC120", "Medium", "Medium", "High", 5],
        ["SHC121", "Low", "High", "Low", 3],
        ["SHC122", "High", "Medium", "Medium", 4],
        ["SHC123", "Medium", "Low", "High", 3],
        ["SHC124", "Low", "High", "Medium", 5],
        ["SHC125", "High", "Medium", "Low", 4],
        ["SHC126", "Medium", "High", "High", 6],
        ["SHC127", "Low", "Medium", "Medium", 3],
        ["SHC128", "High", "Low", "High", 5],
        ["SHC129", "Medium", "High", "Low", 4],
        ["SHC130", "Low", "Medium", "Medium", 3],
        ["SHC131", "High", "High", "High", 5],
        ["SHC132", "Medium", "Medium", "Low", 4],
        ["SHC133", "Low", "Low", "Medium", 3],
        ["SHC134", "High", "Medium", "High", 6],
        ["SHC135", "Medium", "High", "Medium", 5],
        ["SHC136", "Low", "Medium", "Low", 4],
        ["SHC137", "High", "Low", "High", 3],
        ["SHC138", "Medium", "Medium", "Medium", 5],
        ["SHC139", "Low", "High", "Low", 4],
        ["SHC140", "High", "Medium", "Medium", 3]
      ];

      const insertFarmer = db.prepare("INSERT INTO farmers VALUES (?, ?, ?, ?, ?, ?)");
      farmers.forEach(f => insertFarmer.run(f));
      insertFarmer.finalize();

      const insertSoil = db.prepare("INSERT INTO soil_cards VALUES (?, ?, ?, ?, ?)");
      soilCards.forEach(s => insertSoil.run(s));
      insertSoil.finalize();

      const insertRetailer = db.prepare("INSERT INTO retailers VALUES (?, ?, ?)");
      insertRetailer.run("RET001", "Kisan Seva Kendra", "Village A");
      insertRetailer.run("RET002", "Agri Inputs Shop", "Village B");
      insertRetailer.finalize();

      // Seed some past transactions
      const insertTxn = db.prepare("INSERT INTO transactions (aadhaar, aadhaar_id, retailer_id, fertilizer_type, quantity, date, timestamp, status, reason) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
      insertTxn.run("123456789012", "123456789012", "RET001", "Urea", 3, "2026-01-15", "2026-01-15 10:30:00", "GREEN", "Normal Purchase");
      insertTxn.run("123456789012", "123456789012", "RET001", "DAP", 2, "2026-02-10", "2026-02-10 14:20:00", "GREEN", "Normal Purchase");
      insertTxn.run("234567890123", "234567890123", "RET002", "Urea", 18, "2026-02-05", "2026-02-05 09:15:00", "GREEN", "Normal Purchase");
      insertTxn.run("345678901234", "345678901234", "RET001", "Urea", 12, "2026-02-12", "2026-02-12 11:45:00", "YELLOW", "Excess quantity requested");
      insertTxn.run("456789012345", "456789012345", "RET002", "DAP", 8, "2026-02-14", "2026-02-14 16:30:00", "GREEN", "Normal Purchase");
      insertTxn.finalize();
    }
  });
}

export { db };
