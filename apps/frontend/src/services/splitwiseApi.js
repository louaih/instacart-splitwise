// Direct Splitwise API implementation using fetch
class SplitwiseApiService {
  constructor() {
    this.apiKey = import.meta.env.VITE_SPLITWISE_API_KEY
    this.baseUrl = 'https://secure.splitwise.com/api/v3.0'
    // Local proxy server to avoid CORS issues
    this.proxyUrl = 'http://localhost:3001/api/splitwise'
    
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

    const url = `${this.proxyUrl}${endpoint}`
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers
    }

    console.log(`Making request to: ${url}`)
    console.log('Request method:', options.method || 'GET')
    console.log('Request headers:', headers)
    console.log('Request body:', options.body)
    
    try {
      const requestOptions = {
        method: options.method || 'GET',
        headers,
        ...options
      }
      
      // Ensure body is properly serialized
      if (options.body) {
        requestOptions.body = JSON.stringify(options.body)
        console.log('Serialized request body:', requestOptions.body)
      }
      
      const response = await fetch(url, requestOptions)

      console.log(`Response status: ${response.status}`)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error Response:', errorText)
        throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`)
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

  // Search for users by name (first name, last name, or full name)
  async findUserByName(name) {
    try {
      console.log('Searching for user:', name)
      
      // Get friends list
      const friends = await this.getFriends()
      console.log('Available friends:', friends.map(f => `${f.first_name} ${f.last_name}`))
      
      // Search by different name formats
      const searchName = name.toLowerCase().trim()
      const foundUser = friends.find(friend => {
        const firstName = friend.first_name.toLowerCase()
        const lastName = friend.last_name.toLowerCase()
        const fullName = `${firstName} ${lastName}`
        
        return firstName === searchName || 
               lastName === searchName || 
               fullName === searchName ||
               fullName.includes(searchName) ||
               searchName.includes(firstName) ||
               searchName.includes(lastName)
      })
      
      if (foundUser) {
        console.log('Found user:', foundUser)
        return foundUser
      } else {
        console.log('User not found in friends list:', name)
        return null
      }
    } catch (error) {
      console.error('Error searching for user:', error)
      return null
    }
  }

  // Create multiple expenses for the splits with proper user mapping
  async createExpensesForSplits(splits, orderData, groupId = null) {
    try {
      if (!this.isInitialized()) {
        throw new Error('Splitwise API not initialized. Please set up API key.')
      }
      
      console.log('Creating expenses for splits:', splits.length, 'splits')
      
      const results = []
      const userMapping = {} // Cache for user lookups
      
      for (const split of splits) {
        console.log(`Processing split for: ${split.person}`)
        
        // Find the Splitwise user for this person
        let splitwiseUser = userMapping[split.person]
        if (!splitwiseUser) {
          splitwiseUser = await this.findUserByName(split.person)
          userMapping[split.person] = splitwiseUser
        }
        
        if (!splitwiseUser) {
          console.warn(`Could not find Splitwise user for: ${split.person}`)
          // Create expense for current user with note about intended recipient
          const expenseData = this.formatExpenseForCurrentUser(split, orderData, groupId)
          const result = await this.createExpense(expenseData)
          results.push({
            ...result,
            person: split.person,
            amount: split.totalOwed,
            note: `Intended for: ${split.person} (not found in Splitwise friends)`
          })
        } else {
          // Create expense for the found user
          const expenseData = this.formatExpenseForUser(split, orderData, groupId, splitwiseUser)
          const result = await this.createExpense(expenseData)
          results.push({
            ...result,
            person: split.person,
            amount: split.totalOwed,
            splitwiseUser: splitwiseUser
          })
        }
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
    
    // Format the expense data according to Splitwise API documentation
    const expenseData = {
      cost: totalOwed.toFixed(2),
      description: expenseName,
      details: `Items: ${itemNames}`,
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
      currency_code: 'USD',
      category_id: 18, // Food & Drink category
      group_id: groupId || 0,
      // Current user pays and owes the full amount (simplified for now)
      users__0__user_id: null, // null means current user
      users__0__paid_share: totalOwed.toFixed(2),
      users__0__owed_share: totalOwed.toFixed(2)
    }

    return expenseData
  }

  // Format expense for current user (fallback when person not found)
  formatExpenseForCurrentUser(split, orderData, groupId = null) {
    const { person, itemsTotal, feeShare, totalOwed, items } = split
    
    const itemNames = items.map(item => item.name).join(', ')
    const expenseName = `Instacart Order - ${itemNames}`
    
    return {
      cost: totalOwed.toFixed(2),
      description: expenseName,
      details: `Items: ${itemNames} (Intended for: ${person})`,
      date: new Date().toISOString().split('T')[0],
      currency_code: 'USD',
      category_id: 18,
      group_id: groupId || 0,
      users__0__user_id: null, // Current user
      users__0__paid_share: totalOwed.toFixed(2),
      users__0__owed_share: totalOwed.toFixed(2)
    }
  }

  // Format expense for specific Splitwise user
  formatExpenseForUser(split, orderData, groupId = null, splitwiseUser = null) {
    const { person, itemsTotal, feeShare, totalOwed, items } = split
    
    const itemNames = items.map(item => item.name).join(', ')
    const expenseName = `Instacart Order - ${itemNames}`
    
    const expenseData = {
      cost: totalOwed.toFixed(2),
      description: expenseName,
      details: `Items: ${itemNames}`,
      date: new Date().toISOString().split('T')[0],
      currency_code: 'USD',
      category_id: 18,
      group_id: groupId || 0
    }
    
    if (splitwiseUser) {
      // Current user pays, specific user owes
      expenseData.users__0__user_id = null // Current user (payer)
      expenseData.users__0__paid_share = totalOwed.toFixed(2)
      expenseData.users__0__owed_share = '0.00'
      
      expenseData.users__1__user_id = splitwiseUser.id // Specific user (owes)
      expenseData.users__1__paid_share = '0.00'
      expenseData.users__1__owed_share = totalOwed.toFixed(2)
    } else {
      // Fallback to current user
      expenseData.users__0__user_id = null
      expenseData.users__0__paid_share = totalOwed.toFixed(2)
      expenseData.users__0__owed_share = totalOwed.toFixed(2)
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
        group_id: groupId || 0,
        // Current user pays the full amount
        users__0__user_id: null, // null means current user
        users__0__paid_share: totalAmount.toFixed(2),
        users__0__owed_share: '0.00'
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