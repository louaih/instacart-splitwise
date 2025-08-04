// Direct Splitwise API implementation using fetch
class SplitwiseApiService {
  constructor() {
    this.apiKey = import.meta.env.VITE_SPLITWISE_API_KEY
    this.baseUrl = 'https://secure.splitwise.com/api/v3.0'
    
    // Debug logging
    console.log('Splitwise API Service - Environment Variables:')
    console.log('API Key:', this.apiKey ? 'SET' : 'NOT SET')
  }

  // Check if API is properly initialized
  isInitialized() {
    return this.apiKey !== null && this.apiKey !== undefined
  }

  // Helper method to make API requests
  async makeRequest(endpoint, options = {}) {
    if (!this.isInitialized()) {
      throw new Error('Splitwise API not initialized. Please set up API key.')
    }

    const url = `${this.baseUrl}${endpoint}`
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers
    }

    console.log(`Making request to: ${url}`)
    
    try {
      const response = await fetch(url, {
        method: options.method || 'GET',
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
        ...options
      })

      console.log(`Response status: ${response.status}`)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error:', errorText)
        throw new Error(`API request failed: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log('API Response:', data)
      return data
    } catch (error) {
      console.error('Request failed:', error)
      throw error
    }
  }

  // Get current user info
  async getCurrentUser() {
    try {
      console.log('Getting current user...')
      const response = await this.makeRequest('/get_current_user')
      return response.user
    } catch (error) {
      console.error('Error getting current user:', error)
      throw error
    }
  }

  // Get user's groups
  async getGroups() {
    try {
      console.log('Getting groups...')
      const response = await this.makeRequest('/get_groups')
      return response.groups
    } catch (error) {
      console.error('Error getting groups:', error)
      throw error
    }
  }

  // Create a new group
  async createGroup(groupData) {
    try {
      console.log('Creating group:', groupData)
      const response = await this.makeRequest('/create_group', {
        method: 'POST',
        body: groupData
      })
      return response.group
    } catch (error) {
      console.error('Error creating group:', error)
      throw error
    }
  }

  // Add user to group
  async addUserToGroup(groupId, userData) {
    try {
      console.log('Adding user to group:', { group_id: groupId, ...userData })
      const response = await this.makeRequest('/add_user_to_group', {
        method: 'POST',
        body: {
          group_id: groupId,
          ...userData
        }
      })
      return response
    } catch (error) {
      console.error('Error adding user to group:', error)
      throw error
    }
  }

  // Create expense
  async createExpense(expenseData) {
    try {
      console.log('Creating expense:', expenseData)
      const response = await this.makeRequest('/create_expense', {
        method: 'POST',
        body: expenseData
      })
      return response.expense
    } catch (error) {
      console.error('Error creating expense:', error)
      throw error
    }
  }

  // Get friends list
  async getFriends() {
    try {
      console.log('Getting friends...')
      const response = await this.makeRequest('/get_friends')
      return response.friends
    } catch (error) {
      console.error('Error getting friends:', error)
      throw error
    }
  }

  // Search for users (filter friends)
  async searchUsers(query) {
    try {
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
        throw new Error('Splitwise API not initialized. Please set up API key.')
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
        throw new Error('Splitwise API not initialized. Please set up API key.')
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
        throw new Error('Splitwise API not initialized. Please set up API key.')
      }
      console.log('Testing Splitwise connection...')
      const user = await this.getCurrentUser()
      console.log('Splitwise test successful - connected as:', user.first_name, user.last_name)
      return { success: true, user }
    } catch (error) {
      console.error('Error testing connection:', error)
      throw error
    }
  }
}

export default new SplitwiseApiService() 