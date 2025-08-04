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
      
      <button 
        className="button" 
        onClick={testConnection}
        disabled={isTesting}
        style={{ marginBottom: '15px' }}
      >
        {isTesting ? 'Testing API Connection...' : 'Test Splitwise API Connection'}
      </button>
      
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
          <strong>Success:</strong> Connected to Splitwise API
          {result.user && (
            <div style={{ marginTop: '5px', fontSize: '0.9rem' }}>
              Logged in as: {result.user.first_name} {result.user.last_name}
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