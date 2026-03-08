import express from 'express';
import { db } from './db.js';

const router = express.Router();

router.get('/farmers/:aadhaar', (req, res) => {
  const { aadhaar } = req.params;
  
  db.get('SELECT * FROM farmers WHERE aadhaar = ?', [aadhaar], (err, farmer) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!farmer) return res.status(404).json({ error: 'Farmer not found in database' });
    
    db.get('SELECT * FROM soil_cards WHERE soil_card_id = ?', [farmer.soil_card_id], (err, soilCard) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ farmer, soilCard });
    });
  });
});

router.post('/transactions/verify', (req, res) => {
  const { aadhaar_id, quantity } = req.body;

  if (!aadhaar_id || !quantity) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  db.get('SELECT * FROM farmers WHERE aadhaar = ?', [aadhaar_id], (err, farmer) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!farmer) return res.status(404).json({ error: 'Farmer not found in database' });

    db.get('SELECT * FROM soil_cards WHERE soil_card_id = ?', [farmer.soil_card_id], (err, soilCard) => {
      if (err) return res.status(500).json({ error: err.message });

      const recommendedBags = farmer.land_size * 4;
      const threshold120 = recommendedBags * 1.2;
      
      let status = 'GREEN';
      let checks = [];

      checks.push({
        id: 'aadhaar',
        name: 'Aadhaar Verified',
        passed: true,
        details: `Aadhaar ${aadhaar_id} verified in government database.`,
        color: 'green'
      });

      checks.push({
        id: 'farmer',
        name: 'Farmer Details Loaded',
        passed: true,
        details: `Name: ${farmer.name}\nDistrict: ${farmer.district}\nCrop: ${farmer.crop}`,
        color: 'green'
      });

      checks.push({
        id: 'land',
        name: 'Land Size Fetched',
        passed: true,
        details: `Registered land size: ${farmer.land_size} acres`,
        color: 'green'
      });

      checks.push({
        id: 'soil',
        name: 'Soil Health Card Checked',
        passed: true,
        details: `Soil Card ID: ${farmer.soil_card_id}\nNitrogen: ${soilCard.nitrogen_level}\nPhosphorus: ${soilCard.phosphorus_level}\nPotassium: ${soilCard.potassium_level}\nRecommended Urea: ${soilCard.recommended_urea_per_acre} bags/acre`,
        color: 'green'
      });

      checks.push({
        id: 'calculation',
        name: 'Crop Fertilizer Requirement Calculated',
        passed: true,
        details: `Land Size: ${farmer.land_size} acres\nRecommended Fertilizer: ${recommendedBags} bags\nRequested Quantity: ${quantity} bags`,
        color: 'green'
      });

      db.all(
        'SELECT * FROM transactions WHERE aadhaar = ? AND date >= date("now", "-30 days") ORDER BY date DESC',
        [aadhaar_id],
        (err, recentTxns) => {
          if (err) return res.status(500).json({ error: err.message });

          const purchaseCount = recentTxns.length;
          const lastPurchase = recentTxns[0]?.date || 'None';
          const totalBags = recentTxns.reduce((sum, t) => sum + parseFloat(t.quantity), 0);
          const monthlyRecommended = recommendedBags * 1.5;

          checks.push({
            id: 'history',
            name: 'Purchase History',
            passed: purchaseCount <= 3,
            details: `Last purchase: ${lastPurchase}\nPurchases in last 30 days: ${purchaseCount}`,
            color: purchaseCount > 3 ? 'yellow' : 'green'
          });

          if (purchaseCount > 3) {
            checks.push({
              id: 'frequent',
              name: 'Frequent Purchases Detected',
              passed: false,
              details: `⚠️ Farmer has made ${purchaseCount} purchases in last 30 days (threshold: 3)\nThis pattern requires additional verification.`,
              color: 'yellow'
            });
          }

          if (totalBags > monthlyRecommended) {
            checks.push({
              id: 'excess_usage',
              name: 'High Fertilizer Quantity Usage Detected',
              passed: false,
              details: `⚠️ Total bags purchased in last 30 days: ${totalBags}\nRecommended monthly usage: ${monthlyRecommended.toFixed(1)} bags\nExcess fertilizer purchase pattern detected.`,
              color: 'yellow'
            });
          }

          if (quantity <= recommendedBags) {
            status = 'GREEN';
          } else if (quantity <= threshold120) {
            status = 'YELLOW';
            checks.push({
              id: 'excess',
              name: 'Excess Quantity Warning',
              passed: false,
              details: `Requested ${quantity} bags exceeds recommended ${recommendedBags} bags but within 20% tolerance. OTP verification required.`,
              color: 'yellow'
            });
          } else {
            status = 'RED';
            checks.push({
              id: 'excess_critical',
              name: 'Critical Over-limit Detected',
              passed: false,
              details: `Requested ${quantity} bags far exceeds recommended ${recommendedBags} bags for ${farmer.land_size} acres. Transaction flagged for officer review.`,
              color: 'red'
            });
          }

          if (purchaseCount > 3 || totalBags > monthlyRecommended) {
            status = status === 'GREEN' ? 'YELLOW' : status;
          }

          db.run(
            'INSERT INTO transactions (aadhaar, aadhaar_id, retailer_id, fertilizer_type, quantity, status, reason) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [aadhaar_id, aadhaar_id, req.body.retailer_id || 'RET001', req.body.fertilizer_type || 'Urea', quantity, status, 
             status === 'RED' ? 'Critical over-limit detected' : status === 'YELLOW' ? 'Excess quantity or frequent purchases' : 'Normal Purchase'],
            function(err) {
              if (err) return res.status(500).json({ error: err.message });

              res.json({
                transactionId: this.lastID,
                status,
                recommendedQuantity: recommendedBags,
                checks,
                message: 'Transaction analyzed'
              });
            }
          );
        }
      );
    });
  });
});

router.get('/admin/stats', (req, res) => {
  db.all('SELECT * FROM transactions ORDER BY date DESC LIMIT 50', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    
    let total = rows.length;
    let flagged = rows.filter(r => r.status === 'RED' || r.status === 'YELLOW').length;
    
    res.json({
      transactions: rows,
      stats: { total, flagged }
    });
  });
});

export default router;
