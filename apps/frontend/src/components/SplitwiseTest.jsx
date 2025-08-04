import React, { useState } from 'react'
import splitwiseApi from '../services/splitwiseApi'

const SplitwiseTest = () => {
  const [isTesting, setIsTesting] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [apiStatus, setApiStatus] = useState(null)

  const testConnection = async () => {
    setIsTesting(true)
    setError(null)
    setResult(null)
    setApiStatus(null)
    
    try {
      console.log('=== Splitwise API Test Started ===')
      
      // Check if API is initialized
      if (!splitwiseApi.isInitialized()) {
        throw new Error('Splitwise API not initialized - check your API key in .env file')
      }
      
      setApiStatus('API key found, testing connection...')
      
      // Test the connection by getting current user
      const testResult = await splitwiseApi.testConnection()
      setResult(testResult)
      console.log('Test successful:', testResult)
      
      // Try to get groups as well
      try {
        const groups = await splitwiseApi.getGroups()
        console.log('Groups found:', groups.length)
        setApiStatus(`Connected successfully! Found ${groups.length} groups.`)
      } catch (groupError) {
        console.log('Could not fetch groups:', groupError.message)
        setApiStatus('Connected successfully! (Could not fetch groups)')
      }
      
    } catch (err) {
      console.error('Test failed:', err)
      setError(err.message)
      setApiStatus('Connection failed')
    } finally {
      setIsTesting(false)
    }
  }

  const testExpenseCreation = async () => {
    setIsTesting(true)
    setError(null)
    setResult(null)
    setApiStatus(null)
    
    try {
      console.log('=== Testing Expense Creation ===')
      
      if (!splitwiseApi.isInitialized()) {
        throw new Error('Splitwise API not initialized')
      }
      
      setApiStatus('Testing expense creation...')
      
      // Create a simple test expense with correct format
      const testExpense = {
        cost: '10.00',
        description: 'Test Expense',
        details: 'This is a test expense',
        date: new Date().toISOString().split('T')[0],
        currency_code: 'USD',
        category_id: 18,
        group_id: 0,
        // Current user pays and owes the full amount
        users__0__user_id: null, // null means current user
        users__0__paid_share: '10.00',
        users__0__owed_share: '10.00'
      }
      
      console.log('Creating test expense:', testExpense)
      const result = await splitwiseApi.createExpense(testExpense)
      console.log('Test expense created:', result)
      
      setResult({ type: 'expense', data: result })
      setApiStatus('Test expense created successfully!')
      
    } catch (err) {
      console.error('Expense test failed:', err)
      setError(err.message)
      setApiStatus('Expense creation failed')
    } finally {
      setIsTesting(false)
    }
  }

  const testUserMatching = async () => {
    setIsTesting(true)
    setError(null)
    setResult(null)
    setApiStatus(null)
    
    try {
      console.log('=== Testing User Matching ===')
      
      if (!splitwiseApi.isInitialized()) {
        throw new Error('Splitwise API not initialized')
      }
      
      setApiStatus('Testing user matching...')
      
      // Get friends list
      const friends = await splitwiseApi.getFriends()
      console.log('Available friends:', friends)
      
      // Test matching some sample names
      const testNames = ['John', 'Jane', 'Smith', 'Doe']
      const matches = []
      
      for (const name of testNames) {
        const match = await splitwiseApi.findUserByName(name)
        matches.push({ name, found: !!match, user: match })
      }
      
      console.log('User matching results:', matches)
      
      setResult({ 
        type: 'matching', 
        friends: friends,
        matches: matches
      })
      setApiStatus(`Found ${friends.length} friends. Tested matching for ${testNames.length} names.`)
      
    } catch (err) {
      console.error('User matching test failed:', err)
      setError(err.message)
      setApiStatus('User matching failed')
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <div style={{ 
      background: '#f8f9fa', 
      padding: '20px', 
      borderRadius: '10px',
      marginBottom: '20px'
    }}>
      <h3 style={{ color: '#333', marginBottom: '15px' }}>Splitwise API Connection Test</h3>
      
      <div style={{ marginBottom: '15px', fontSize: '0.9rem', color: '#666' }}>
        <p>This will test your Splitwise API connection using the direct API endpoints.</p>
        <p>Make sure you have set <code>VITE_SPLITWISE_API_KEY</code> in your .env file.</p>
      </div>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
        <button 
          className="button" 
          onClick={testConnection}
          disabled={isTesting}
          style={{ marginBottom: '0' }}
        >
          {isTesting ? 'Testing...' : 'Test Connection'}
        </button>
        
        <button 
          className="button" 
          onClick={testExpenseCreation}
          disabled={isTesting}
          style={{ 
            marginBottom: '0',
            background: '#17a2b8'
          }}
        >
          {isTesting ? 'Testing...' : 'Test Expense Creation'}
        </button>
        
        <button 
          className="button" 
          onClick={testUserMatching}
          disabled={isTesting}
          style={{ 
            marginBottom: '0',
            background: '#6f42c1'
          }}
        >
          {isTesting ? 'Testing...' : 'Test User Matching'}
        </button>
      </div>
      
      {apiStatus && (
        <div style={{ 
          background: '#e7f3ff', 
          color: '#0c5460', 
          padding: '10px', 
          borderRadius: '5px',
          marginBottom: '15px',
          fontSize: '0.9rem'
        }}>
          <strong>Status:</strong> {apiStatus}
        </div>
      )}
      
      {error && (
        <div style={{ 
          background: '#f8d7da', 
          color: '#721c24', 
          padding: '10px', 
          borderRadius: '5px',
          marginBottom: '15px'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {result && (
        <div style={{ 
          background: '#d4edda', 
          color: '#155724', 
          padding: '10px', 
          borderRadius: '5px',
          marginBottom: '15px'
        }}>
          <strong>Success:</strong> {
            result.type === 'expense' ? 'Test expense created!' : 
            result.type === 'matching' ? 'User matching test completed!' :
            'Connected to Splitwise API'
          }
          {result.user && (
            <div style={{ marginTop: '5px', fontSize: '0.9rem' }}>
              Logged in as: {result.user.first_name} {result.user.last_name}
            </div>
          )}
          {result.friends && (
            <div style={{ marginTop: '5px', fontSize: '0.9rem' }}>
              Available friends: {result.friends.length}
              <div style={{ marginTop: '5px', maxHeight: '100px', overflowY: 'auto' }}>
                {result.friends.map(friend => (
                  <div key={friend.id} style={{ fontSize: '0.8rem' }}>
                    • {friend.first_name} {friend.last_name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '10px' }}>
        <p>Check the browser console for detailed API request/response logs.</p>
        <p>If you get CORS errors, you may need to use a proxy or backend service.</p>
      </div>
    </div>
  )
}

export default SplitwiseTest 