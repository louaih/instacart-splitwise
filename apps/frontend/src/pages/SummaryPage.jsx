import React, { useState } from 'react'
import splitwiseApi from '../services/splitwiseApi'
import { validateExpenseData } from '../utils/expenseHelpers'
import LoadingSpinner from '../components/LoadingSpinner'

const SummaryPage = ({ orderData, setOrderData, prevStep, currentStep, totalSteps }) => {
  const [isSending, setIsSending] = useState(false)
  const [sentSuccess, setSentSuccess] = useState(false)
  const [error, setError] = useState(null)

  // Calculate splits
  const calculateSplits = () => {
    const people = [...new Set(orderData.items.map(item => item.assignedTo).filter(Boolean))]
    const subtotal = orderData.items.reduce((sum, item) => sum + item.price, 0)
    const totalFees = orderData.fees.delivery + orderData.fees.service + orderData.fees.tip + orderData.fees.tax
    const totalWithFees = subtotal + totalFees
    
    const splits = people.map(person => {
      const personItems = orderData.items.filter(item => item.assignedTo === person)
      const itemsTotal = personItems.reduce((sum, item) => sum + item.price, 0)
      
      // Calculate proportional fees based on share of order
      const orderShare = itemsTotal / subtotal
      const feeShare = totalFees * orderShare
      const totalOwed = itemsTotal + feeShare
      
      return {
        person,
        items: personItems,
        itemsTotal,
        orderShare: orderShare * 100, // Convert to percentage
        feeShare,
        totalOwed
      }
    })

    return { splits, totalWithFees }
  }

  const { splits, totalWithFees } = calculateSplits()

  const sendToSplitwise = async () => {
    setIsSending(true)
    setError(null)
    
    try {
      // Check if API is initialized
      if (!splitwiseApi.isInitialized()) {
        throw new Error('Splitwise API not configured. Please set up API key in your .env file.')
      }
      
      // Test the connection
      await splitwiseApi.testConnection()
      
      // Get current user to verify authentication
      const currentUser = await splitwiseApi.getCurrentUser()
      console.log('Connected as:', currentUser.first_name, currentUser.last_name)
      
      // Create expenses using the API
      const result = await splitwiseApi.createExpensesForSplits(splits, orderData)
      
      setIsSending(false)
      setSentSuccess(true)
    } catch (err) {
      console.error('Error sending to Splitwise:', err)
      
      // Provide specific error messages
      let errorMessage = 'Failed to send expenses to Splitwise'
      
      if (err.message.includes('not configured')) {
        errorMessage = 'Splitwise API not configured. Please add your API key to the .env file.'
      } else if (err.message.includes('401')) {
        errorMessage = 'Invalid API key. Please check your Splitwise API key.'
      } else if (err.message.includes('403')) {
        errorMessage = 'Access forbidden. Please check your API permissions.'
      } else if (err.message.includes('CORS')) {
        errorMessage = 'CORS error. The API may not be accessible from the browser.'
      } else if (err.message.includes('network')) {
        errorMessage = 'Network error. Please check your internet connection.'
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
      setIsSending(false)
    }
  }

  const subtotal = orderData.items.reduce((sum, item) => sum + item.price, 0)
  const totalFees = orderData.fees.delivery + orderData.fees.service + orderData.fees.tip + orderData.fees.tax

  if (isSending) {
    return (
      <div className="container">
        <LoadingSpinner 
          message="Sending expenses to Splitwise..." 
          size="large"
        />
      </div>
    )
  }

  return (
    <div className="container">
      <h1 className="title">Order Summary</h1>
      <p className="subtitle">
        Review the final split and send to Splitwise
      </p>

      {error && (
        <div style={{ 
          background: '#f8d7da', 
          color: '#721c24', 
          padding: '15px', 
          borderRadius: '10px',
          marginBottom: '20px',
          border: '1px solid #f5c6cb'
        }}>
          <h3 style={{ marginBottom: '10px' }}>❌ Error</h3>
          <p>{error}</p>
          <button 
            className="button" 
            onClick={() => setError(null)}
            style={{ 
              marginTop: '10px',
              background: '#dc3545',
              fontSize: '0.9rem',
              padding: '8px 16px'
            }}
          >
            Try Again
          </button>
        </div>
      )}

      <div style={{ marginBottom: '30px' }}>
        <div style={{ 
          background: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '10px', 
          marginBottom: '20px' 
        }}>
          <h3 style={{ color: '#333', marginBottom: '15px' }}>Final Split:</h3>
          {splits.map(split => (
            <div key={split.person} style={{ marginBottom: '15px' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '10px'
              }}>
                <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>{split.person}</span>
                <span style={{ fontWeight: '600', color: '#667eea', fontSize: '1.2rem' }}>
                  ${split.totalOwed.toFixed(2)}
                </span>
              </div>
              <div style={{ fontSize: '0.9rem', color: '#666', marginLeft: '10px' }}>
                <div>Items: ${split.itemsTotal.toFixed(2)} ({split.orderShare.toFixed(1)}% of order)</div>
                <div>Fees & Tax: ${split.feeShare.toFixed(2)} ({split.orderShare.toFixed(1)}% of fees)</div>
                <div style={{ marginTop: '5px' }}>
                  <strong>Items:</strong> {split.items.map(item => item.name).join(', ')}
                </div>
              </div>
            </div>
          ))}
          <div style={{ 
            borderTop: '2px solid #e9ecef', 
            paddingTop: '15px', 
            marginTop: '15px',
            display: 'flex',
            justifyContent: 'space-between',
            fontWeight: '600',
            fontSize: '1.2rem'
          }}>
            <span>Total:</span>
            <span>${totalWithFees.toFixed(2)}</span>
          </div>
        </div>

        {/* Fee Breakdown */}
        <div style={{ 
          background: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '10px', 
          marginBottom: '20px' 
        }}>
          <h3 style={{ color: '#333', marginBottom: '15px' }}>Fee Breakdown:</h3>
          <div className="summary-item">
            <span>Subtotal ({orderData.items.length} items):</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-item">
            <span>Delivery Fee:</span>
            <span>${orderData.fees.delivery.toFixed(2)}</span>
          </div>
          <div className="summary-item">
            <span>Service Fee:</span>
            <span>${orderData.fees.service.toFixed(2)}</span>
          </div>
          <div className="summary-item">
            <span>Tip:</span>
            <span>${orderData.fees.tip.toFixed(2)}</span>
          </div>
          <div className="summary-item">
            <span>Tax:</span>
            <span>${orderData.fees.tax.toFixed(2)}</span>
          </div>
          <div className="summary-item">
            <span>Total Fees:</span>
            <span>${totalFees.toFixed(2)}</span>
          </div>
          <div style={{ 
            marginTop: '15px', 
            padding: '10px', 
            background: '#e9ecef', 
            borderRadius: '5px',
            fontSize: '0.9rem',
            color: '#666'
          }}>
            <strong>Note:</strong> Fees are distributed proportionally based on each person's share of the order total.
          </div>
        </div>
      </div>

      {sentSuccess ? (
        <div style={{ 
          background: '#d4edda', 
          color: '#155724', 
          padding: '20px', 
          borderRadius: '10px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <h3 style={{ marginBottom: '10px' }}>✅ Success!</h3>
          <p>Split requests have been sent to Splitwise for all participants.</p>
        </div>
      ) : (
        <div style={{ marginBottom: '20px' }}>
          <button 
            className="button" 
            onClick={sendToSplitwise}
            disabled={isSending}
            style={{ fontSize: '1.2rem', padding: '20px 40px' }}
          >
            Send to Splitwise
          </button>
          <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '10px' }}>
            This will create expense requests in Splitwise for each person
          </p>
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button className="button button-secondary" onClick={prevStep}>
          Back
        </button>
        {sentSuccess && (
          <button 
            className="button" 
            onClick={() => window.location.reload()}
          >
            Start New Order
          </button>
        )}
      </div>
    </div>
  )
}

export default SummaryPage 