# SubsidyGuard
  SubsidyGuard is a prototype system designed to reduce misuse of fertilizer subsidies by verifying purchases made at fertilizer retail POS systems. The idea behind the project is to simulate how a government-backed digital verification layer could help detect abnormal purchase patterns before subsidies are misused.
  In many cases, subsidized fertilizers meant for farmers can be diverted or purchased in unrealistic quantities. SubsidyGuard attempts to address this by validating each purchase using farmer records such as Aadhaar identity, land size, soil health information, and past purchase history.
The system analyzes each transaction and classifies it using a simple risk model:

Green – purchase appears normal
Yellow – slightly suspicious and requires additional verification
Red – highly abnormal transaction and flagged for review

This helps simulate how digital checks could strengthen transparency in subsidy distribution.
# Key Features
1.POS Transaction Verification
  Simulates a fertilizer retailer POS where purchases are verified before approval.
2.Automatic Farmer Record Lookup
  Uses Aadhaar ID to fetch farmer details such as land size, crop type, and soil health card data from a database.
3.Smart Purchase Monitoring
  Detects suspicious patterns based on fertilizer quantity and purchase frequency.
4.Risk Classification System
  Transactions are categorized as Green, Yellow, or Red depending on how closely they match recommended fertilizer usage.
5.Admin Monitoring Dashboard
  Allows administrators to view flagged transactions and identify abnormal purchase behavior.
# Tech Stack
Frontend - React.js, Vite, Tailwind CSS
Backend - Node.js, Express.js
Database - SQLite
Deployment - Render
Version Control - Git & GitHub
# How It Works
1. A retailer enters the farmer’s Aadhaar ID and purchase details at the POS interface.
2. The system retrieves farmer information from the database.
3. Fertilizer requirements are calculated based on land size and crop.
4. Purchase history is analyzed to detect frequent or abnormal transactions.
5. The transaction is classified as Green, Yellow, or Red and displayed to the retailer.

# Running the Project Locally
Backend
  cd server
  npm install
  node server.js

Frontend
  cd client
  npm install
  npm run dev

The application will start on:
  Frontend: http://localhost:5173
  Backend: http://localhost:5000

This project was built as a prototype to explore how digital verification and transaction monitoring systems can help improve accountability in government subsidy distribution programs.

