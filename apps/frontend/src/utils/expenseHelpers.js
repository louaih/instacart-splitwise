// Utility functions for formatting expense data for Splitwise API

export const formatExpenseForSplitwise = (split, orderData, groupId = null) => {
  const { person, itemsTotal, feeShare, totalOwed, items } = split
  
  // Create a descriptive expense name
  const itemNames = items.map(item => item.name).join(', ')
  const expenseName = `Instacart Order - ${itemNames}`
  
  // Format the expense data
  const expenseData = {
    cost: totalOwed.toFixed(2),
    description: expenseName,
    details: `Items: ${itemNames}`,
    date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
    currency_code: 'USD',
    category_id: 18, // Food & Drink category (will need to verify with actual API)
    group_id: groupId,
    split_with: [
      {
        user_id: null, // Will be set based on Splitwise user lookup
        paid_share: totalOwed.toFixed(2),
        owed_share: totalOwed.toFixed(2)
      }
    ]
  }

  return expenseData
}

export const createGroupExpense = (splits, orderData, groupName = 'Instacart Order') => {
  const totalAmount = splits.reduce((sum, split) => sum + split.totalOwed, 0)
  
  // Create group expense where everyone owes their share
  const expenseData = {
    cost: totalAmount.toFixed(2),
    description: `Instacart Order - ${orderData.items.length} items`,
    details: `Delivery: $${orderData.fees.delivery.toFixed(2)}, Service: $${orderData.fees.service.toFixed(2)}, Tip: $${orderData.fees.tip.toFixed(2)}, Tax: $${orderData.fees.tax.toFixed(2)}`,
    date: new Date().toISOString().split('T')[0],
    currency_code: 'USD',
    category_id: 18, // Food & Drink
    group_id: null, // Will be set when group is created
    split_with: splits.map(split => ({
      user_id: null, // Will be set based on Splitwise user lookup
      paid_share: '0.00',
      owed_share: split.totalOwed.toFixed(2)
    }))
  }

  return expenseData
}

export const validateExpenseData = (expenseData) => {
  const errors = []
  
  if (!expenseData.cost || parseFloat(expenseData.cost) <= 0) {
    errors.push('Invalid cost amount')
  }
  
  if (!expenseData.description || expenseData.description.trim() === '') {
    errors.push('Expense description is required')
  }
  
  if (!expenseData.split_with || expenseData.split_with.length === 0) {
    errors.push('At least one person must be assigned to the expense')
  }
  
  return errors
}

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

export const calculateTotalFees = (fees) => {
  return fees.delivery + fees.service + fees.tip + fees.tax
}

export const getFeeBreakdown = (fees) => {
  return [
    { name: 'Delivery Fee', amount: fees.delivery },
    { name: 'Service Fee', amount: fees.service },
    { name: 'Tip', amount: fees.tip },
    { name: 'Tax', amount: fees.tax }
  ].filter(fee => fee.amount > 0)
} 