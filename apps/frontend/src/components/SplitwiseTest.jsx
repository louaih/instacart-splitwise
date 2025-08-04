import React, { useState } from 'react'
import splitwiseApi from '../services/splitwiseApi'

const SplitwiseTest = () => {
  const [isTesting, setIsTesting] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const testConnection = async () => {
    setIsTesting(true)
    setError(null)
    setResult(null)
    
    try {
      console.log('=== Splitwise Test Started ===')
      
      // Check if API is initialized
      if (!splitwiseApi.isInitialized()) {
        throw new Error('Splitwise API not initialized')
      }
      
      // Test the connection
      const testResult = await splitwiseApi.testConnection()
      setResult(testResult)
      console.log('Test successful:', testResult)
      
      // Try to get current user
      const user = await splitwiseApi.getCurrentUser()
      console.log('Current user:', user)
      
    } catch (err) {
      console.error('Test failed:', err)
      setError(err.message)
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
      <h3 style={{ color: '#333', marginBottom: '15px' }}>Splitwise Connection Test</h3>
      
      <button 
        className="button" 
        onClick={testConnection}
        disabled={isTesting}
        style={{ marginBottom: '15px' }}
      >
        {isTesting ? 'Testing...' : 'Test Splitwise Connection'}
      </button>
      
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
          borderRadius: '5px'
        }}>
          <strong>Success:</strong> Connection test passed
        </div>
      )}
      
      <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '10px' }}>
        <p>Check the browser console for detailed logs.</p>
      </div>
    </div>
  )
}

export default SplitwiseTest 