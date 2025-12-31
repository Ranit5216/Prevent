# Dashboard Metrics - Mathematical Formulas

## 1. Total Revenue (₹0.00)

**Formula:**
```
Total Revenue = Σ(Order Amount) for all ACCEPTED and DELIVERED orders
```

**Calculation:**
```
Total Revenue = Sum of all order.totalAmt 
                WHERE order_status IN ['ACCEPTED', 'DELIVERED']
                AND admin_id = current_admin_id
```

**Percentage Change:**
```
Revenue Change % = ((Current Month Revenue - Last Month Revenue) / Last Month Revenue) × 100
```

**Example:**
- Current Month: ₹50,000
- Last Month: ₹50,000
- Change: ((50,000 - 50,000) / 50,000) × 100 = 0%

---

## 2. Total Orders (13)

**Formula:**
```
Total Orders = COUNT(Orders) WHERE order_status IN ['ACCEPTED', 'DELIVERED']
```

**Calculation:**
```
Total Orders = Number of orders 
               WHERE order_status IN ['ACCEPTED', 'DELIVERED']
               AND admin_id = current_admin_id
```

**Percentage Change:**
```
Orders Change % = ((Current Month Orders - Last Month Orders) / Last Month Orders) × 100
```

**Example:**
- Current Month: 13 orders
- Last Month: 13 orders
- Change: ((13 - 13) / 13) × 100 = 0%

---

## 3. Active Customers (5)

**Formula:**
```
Active Customers = COUNT(DISTINCT userId) 
                   WHERE order_status IN ['ACCEPTED', 'DELIVERED']
```

**Calculation:**
```
Active Customers = Number of unique users who have placed orders
                   WHERE order_status IN ['ACCEPTED', 'DELIVERED']
                   AND admin_id = current_admin_id
```

**Percentage Change:**
```
Customers Change % = ((Current Month Unique Customers - Last Month Unique Customers) / Last Month Unique Customers) × 100
```

**Example:**
- Current Month: 5 unique customers
- Last Month: 5 unique customers
- Change: ((5 - 5) / 5) × 100 = 0%

---

## 4. Average Rating (4.3)

**Formula:**
```
Average Rating = (Σ(All Ratings)) / (Number of Reviews)
```

**Calculation:**
```
Average Rating = Sum of all review.rating 
                 / COUNT(reviews)
                 WHERE product.admin_id = current_admin_id
                 AND review.status = 'active'
```

**Step-by-step:**
1. Get all products by admin: `products WHERE admin_id = current_admin_id`
2. Get all reviews for those products: `reviews WHERE productId IN (admin_products) AND status = 'active'`
3. Calculate average: `AVG(review.rating)`

**Change:**
```
Rating Change = Current Average Rating - Previous Average Rating
```

**Example:**
- Current: 4.3
- Previous: 4.1
- Change: 4.3 - 4.1 = +0.2

---

## 5. Total Products (14)

**Formula:**
```
Total Products = COUNT(Products) WHERE public = true AND admin_id = current_admin_id
```

**Calculation:**
```
Total Products = Number of products 
                 WHERE public = true
                 AND admin_id = current_admin_id
```

**New Products:**
```
New Products = COUNT(Products) 
               WHERE createdAt >= Current Month Start
               AND admin_id = current_admin_id
```

**Example:**
- Total: 14 products
- New this period: 5 products
- Display: "+5 new"

---

## 6. Total Commission/Earnings (₹0.00)

**Formula (with 100% Commission Rate):**
```
Total Earnings = Total Revenue × Commission Rate
Total Earnings = Total Revenue × 100% = Total Revenue (since 100% = full amount)
```

**Calculation:**
```
Total Earnings = Total Revenue (when commission rate is 0%)
                = Σ(Order Amount) for all ACCEPTED and DELIVERED orders
```

**This Month Earnings:**
```
This Month Earnings = Σ(Order Amount) 
                      WHERE order_status IN ['ACCEPTED', 'DELIVERED']
                      AND createdAt >= Current Month Start
                      AND admin_id = current_admin_id
```

**Pending Earnings:**
```
Pending Earnings = Σ(Order Amount) 
                   WHERE order_status = 'ACCEPTED'
                   AND admin_id = current_admin_id
```

**Percentage Change:**
```
Earnings Change % = ((Current Month Earnings - Last Month Earnings) / Last Month Earnings) × 100
```

**Example:**
- Current Month Earnings: ₹10,000
- Last Month Earnings: ₹8,500
- Change: ((10,000 - 8,500) / 8,500) × 100 = +17.65% ≈ +18%

**Note:** With 100% commission rate, the admin/vendor receives the full order amount (no platform fee deducted).

---

## Complete Calculation Flow

### Step 1: Define Time Periods
```
Current Month Start = First day of current month (00:00:00)
Current Month End = Now
Last Month Start = First day of previous month (00:00:00)
Last Month End = Last day of previous month (23:59:59)
```

### Step 2: Calculate Current Period Metrics
```
Current Revenue = SUM(order.totalAmt) 
                  WHERE order_status IN ['ACCEPTED', 'DELIVERED']
                  AND createdAt >= Current Month Start
                  AND admin_id = admin_id

Current Orders = COUNT(orders)
                  WHERE order_status IN ['ACCEPTED', 'DELIVERED']
                  AND createdAt >= Current Month Start
                  AND admin_id = admin_id

Current Customers = COUNT(DISTINCT userId)
                    WHERE order_status IN ['ACCEPTED', 'DELIVERED']
                    AND createdAt >= Current Month Start
                    AND admin_id = admin_id
```

### Step 3: Calculate Previous Period Metrics
```
Last Month Revenue = SUM(order.totalAmt) 
                      WHERE order_status IN ['ACCEPTED', 'DELIVERED']
                      AND createdAt >= Last Month Start
                      AND createdAt <= Last Month End
                      AND admin_id = admin_id

Last Month Orders = COUNT(orders)
                    WHERE order_status IN ['ACCEPTED', 'DELIVERED']
                    AND createdAt >= Last Month Start
                    AND createdAt <= Last Month End
                    AND admin_id = admin_id

Last Month Customers = COUNT(DISTINCT userId)
                       WHERE order_status IN ['ACCEPTED', 'DELIVERED']
                       AND createdAt >= Last Month Start
                       AND createdAt <= Last Month End
                       AND admin_id = admin_id
```

### Step 4: Calculate Percentage Changes
```
Revenue Change % = ((Current Revenue - Last Month Revenue) / Last Month Revenue) × 100
Orders Change % = ((Current Orders - Last Month Orders) / Last Month Orders) × 100
Customers Change % = ((Current Customers - Last Month Customers) / Last Month Customers) × 100
```

### Step 5: Handle Edge Cases
```
IF Last Month Revenue = 0:
    Revenue Change % = 0 (to avoid division by zero)

IF Last Month Orders = 0:
    Orders Change % = 0 (to avoid division by zero)

IF Last Month Customers = 0:
    Customers Change % = 0 (to avoid division by zero)
```

---

## Database Query Examples

### Total Revenue Query (MongoDB Aggregation)
```javascript
OrderModel.aggregate([
  { 
    $match: { 
      admin_id: adminId, 
      order_status: { $in: ['ACCEPTED', 'DELIVERED'] } 
    } 
  },
  { 
    $group: { 
      _id: null, 
      total: { $sum: '$totalAmt' } 
    } 
  }
])
```

### Average Rating Query (MongoDB Aggregation)
```javascript
ReviewModel.aggregate([
  {
    $lookup: {
      from: 'products',
      localField: 'productId',
      foreignField: '_id',
      as: 'product'
    }
  },
  {
    $match: {
      'product.admin_id': adminId,
      status: 'active'
    }
  },
  {
    $group: {
      _id: null,
      average: { $avg: '$rating' },
      count: { $sum: 1 }
    }
  }
])
```

### Active Customers Query
```javascript
OrderModel.distinct('userId', {
  admin_id: adminId,
  order_status: { $in: ['ACCEPTED', 'DELIVERED'] }
})
```

---

## Summary

All metrics follow this pattern:
1. **Filter** by admin_id and relevant statuses
2. **Aggregate** using SUM, COUNT, AVG, or DISTINCT
3. **Compare** current period vs previous period
4. **Calculate** percentage change
5. **Display** with appropriate formatting

The key formulas are:
- **Revenue**: `Σ(amount)` 
- **Orders**: `COUNT(*)`
- **Customers**: `COUNT(DISTINCT userId)`
- **Rating**: `AVG(rating)`
- **Products**: `COUNT(*)`
- **Earnings**: `Revenue × Commission Rate` (100% = full revenue, no platform fee)

