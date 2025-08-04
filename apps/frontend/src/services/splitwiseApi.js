// Splitwise API Service using the keriwarr/splitwise npm package
import Splitwise from 'splitwise'

class SplitwiseApiService {
  constructor() {
    this.consumerKey = import.meta.env.VITE_SPLITWISE_CONSUMER_KEY
    this.consumerSecret = import.meta.env.VITE_SPLITWISE_CONSUMER_SECRET
    
    // Debug logging
    console.log('Splitwise API Service - Environment Variables:')
    console.log('Consumer Key:', this.consumerKey ? 'SET' : 'NOT SET')
    console.log('Consumer Secret:', this.consumerSecret ? 'SET' : 'NOT SET')
    
    // Initialize the Splitwise SDK
    this.splitwise = null
    if (this.consumerKey && this.consumerSecret) {
      try {
        this.splitwise = Splitwise({
          consumerKey: this.consumerKey,
          consumerSecret: this.consumerSecret
        })
        console.log('Splitwise SDK initialized successfully')
      } catch (error) {
        console.error('Error initializing Splitwise SDK:', error)
      }
    } else {
      console.error('Missing required environment variables for Splitwise API')
    }
  }

  // Check if API is properly initialized
  isInitialized() {
    return this.splitwise !== null
  }

  // Get current user info
  async getCurrentUser() {
    try {
      if (!this.isInitialized()) {
        throw new Error('Splitwise API not initialized. Please set up consumer key and secret.')
      }
      console.log('Attempting to get current user...')
      const user = await this.splitwise.getCurrentUser()
      console.log('Current user retrieved:', user)
      return user
    } catch (error) {
      console.error('Error getting current user:', error)
      throw error
    }
  }

  // Get user's groups
  async getGroups() {
    try {
      if (!this.isInitialized()) {
        throw new Error('Splitwise API not initialized. Please set up consumer key and secret.')
      }
      return await this.splitwise.getGroups()
    } catch (error) {
      console.error('Error getting groups:', error)
      throw error
    }
  }

  // Create a new group
  async createGroup(groupData) {
    try {
      if (!this.isInitialized()) {
        throw new Error('Splitwise API not initialized. Please set up consumer key and secret.')
      }
      return await this.splitwise.createGroup(groupData)
    } catch (error) {
      console.error('Error creating group:', error)
      throw error
    }
  }

  // Add user to group
  async addUserToGroup(groupId, userData) {
    try {
      if (!this.isInitialized()) {
        throw new Error('Splitwise API not initialized. Please set up consumer key and secret.')
      }
      return await this.splitwise.addUserToGroup({
        group_id: groupId,
        ...userData
      })
    } catch (error) {
      console.error('Error adding user to group:', error)
      throw error
    }
  }

  // Create expense
  async createExpense(expenseData) {
    try {
      if (!this.isInitialized()) {
        throw new Error('Splitwise API not initialized. Please set up consumer key and secret.')
      }
      return await this.splitwise.createExpense(expenseData)
    } catch (error) {
      console.error('Error creating expense:', error)
      throw error
    }
  }

  // Create debt (simpler way to create expenses)
  async createDebt(debtData) {
    try {
      if (!this.isInitialized()) {
        throw new Error('Splitwise API not initialized. Please set up consumer key and secret.')
      }
      return await this.splitwise.createDebt(debtData)
    } catch (error) {
      console.error('Error creating debt:', error)
      throw error
    }
  }

  // Get friends list
  async getFriends() {
    try {
      if (!this.isInitialized()) {
        throw new Error('Splitwise API not initialized. Please set up consumer key and secret.')
      }
      return await this.splitwise.getFriends()
    } catch (error) {
      console.error('Error getting friends:', error)
      throw error
    }
  }

  // Search for users (filter friends)
  async searchUsers(query) {
    try {
      if (!this.isInitialized()) {
        throw new Error('Splitwise API not initialized. Please set up consumer key and secret.')
      }
      const friends = await this.getFriends()
      return friends.filter(friend => 
        friend.first_name.toLowerCase().includes(query.toLowerCase()) ||
        friend.last_name.toLowerCase().includes(query.toLowerCase()) ||
        friend.email.toLowerCase().includes(query.toLowerCase())
      )
    } catch (error) {
      console.error('Error searching users:', error)
      throw error
    }
  }

  // Create multiple expenses for the splits
  async createExpensesForSplits(splits, orderData, groupId = null) {
    try {
      if (!this.isInitialized()) {
        throw new Error('Splitwise API not initialized. Please set up consumer key and secret.')
      }
      
      console.log('Creating expenses for splits:', splits.length, 'splits')
      
      const results = []
      
      for (const split of splits) {
        const expenseData = this.formatExpenseForSplitwise(split, orderData, groupId)
        console.log('Creating expense for:', split.person, expenseData)
        const result = await this.createExpense(expenseData)
        results.push({
          ...result,
          person: split.person,
          amount: split.totalOwed
        })
      }
      
      return {
        success: true,
        expenses: results
      }
    } catch (error) {
      console.error('Error creating expenses:', error)
      throw error
    }
  }

  // Format expense data for Splitwise API
  formatExpenseForSplitwise(split, orderData, groupId = null) {
    const { person, itemsTotal, feeShare, totalOwed, items } = split
    
    // Create a descriptive expense name
    const itemNames = items.map(item => item.name).join(', ')
    const expenseName = `Instacart Order - ${itemNames}`
    
    // Format the expense data according to Splitwise API
    const expenseData = {
      cost: totalOwed.toFixed(2),
      description: expenseName,
      details: `Items: ${itemNames}`,
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
      currency_code: 'USD',
      category_id: 18, // Food & Drink category
      group_id: groupId,
      users: [
        {
          user_id: null, // Will be set based on Splitwise user lookup
          paid_share: totalOwed.toFixed(2),
          owed_share: totalOwed.toFixed(2)
        }
      ]
    }

    return expenseData
  }

  // Create a group expense (alternative approach)
  async createGroupExpense(splits, orderData, groupId, groupName = 'Instacart Order') {
    try {
      if (!this.isInitialized()) {
        throw new Error('Splitwise API not initialized. Please set up consumer key and secret.')
      }
      
      const totalAmount = splits.reduce((sum, split) => sum + split.totalOwed, 0)
      
      // Create group expense where everyone owes their share
      const expenseData = {
        cost: totalAmount.toFixed(2),
        description: `Instacart Order - ${orderData.items.length} items`,
        details: `Delivery: $${orderData.fees.delivery.toFixed(2)}, Service: $${orderData.fees.service.toFixed(2)}, Tip: $${orderData.fees.tip.toFixed(2)}, Tax: $${orderData.fees.tax.toFixed(2)}`,
        date: new Date().toISOString().split('T')[0],
        currency_code: 'USD',
        category_id: 18, // Food & Drink
        group_id: groupId,
        users: splits.map(split => ({
          user_id: null, // Will be set based on Splitwise user lookup
          paid_share: '0.00',
          owed_share: split.totalOwed.toFixed(2)
        }))
      }

      return await this.createExpense(expenseData)
    } catch (error) {
      console.error('Error creating group expense:', error)
      throw error
    }
  }

  // Test connection
  async testConnection() {
    try {
      if (!this.isInitialized()) {
        throw new Error('Splitwise API not initialized. Please set up consumer key and secret.')
      }
      console.log('Testing Splitwise connection...')
      const result = await this.splitwise.test()
      console.log('Splitwise test result:', result)
      return result
    } catch (error) {
      console.error('Error testing connection:', error)
      throw error
    }
  }
}

export default new SplitwiseApiService() 