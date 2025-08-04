import React, { useState } from 'react'

const FeeInputPage = ({ orderData, setOrderData, nextStep, prevStep, currentStep, totalSteps }) => {
  const [deliveryFee, setDeliveryFee] = useState('')
  const [serviceFee, setServiceFee] = useState('')
  const [tip, setTip] = useState('')
  const [tax, setTax] = useState('')

  const handleSubmit = () => {
    const fees = {
      delivery: parseFloat(deliveryFee) || 0,
      service: parseFloat(serviceFee) || 0,
      tip: parseFloat(tip) || 0,
      tax: parseFloat(tax) || 0
    }
    setOrderData(prev => ({ ...prev, fees }))
    nextStep()
  }

  const subtotal = orderData.items.reduce((sum, item) => sum + item.price, 0)
  const totalWithFees = subtotal + 
    (parseFloat(deliveryFee) || 0) + 
    (parseFloat(serviceFee) || 0) + 
    (parseFloat(tip) || 0) + 
    (parseFloat(tax) || 0)

  return (
    <div className="container">
      <h1 className="title">Fees & Tax</h1>
      <p className="subtitle">
        Enter the fees and tax from your Instacart order
      </p>

      <div style={{ marginBottom: '30px' }}>
        <div style={{ 
          background: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '10px', 
          marginBottom: '20px' 
        }}>
          <h3 style={{ color: '#333', marginBottom: '15px' }}>Order Summary:</h3>
          <div className="summary-item">
            <span>Subtotal ({orderData.items.length} items):</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-item">
            <span>Delivery Fee:</span>
            <span>${(parseFloat(deliveryFee) || 0).toFixed(2)}</span>
          </div>
          <div className="summary-item">
            <span>Service Fee:</span>
            <span>${(parseFloat(serviceFee) || 0).toFixed(2)}</span>
          </div>
          <div className="summary-item">
            <span>Tip:</span>
            <span>${(parseFloat(tip) || 0).toFixed(2)}</span>
          </div>
          <div className="summary-item">
            <span>Tax:</span>
            <span>${(parseFloat(tax) || 0).toFixed(2)}</span>
          </div>
          <div className="summary-item">
            <span>Total:</span>
            <span>${totalWithFees.toFixed(2)}</span>
          </div>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '20px',
          marginBottom: '20px'
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600' }}>
              Delivery Fee ($):
            </label>
            <input
              type="number"
              className="input"
              placeholder="0.00"
              value={deliveryFee}
              onChange={(e) => setDeliveryFee(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600' }}>
              Service Fee ($):
            </label>
            <input
              type="number"
              className="input"
              placeholder="0.00"
              value={serviceFee}
              onChange={(e) => setServiceFee(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600' }}>
              Tip ($):
            </label>
            <input
              type="number"
              className="input"
              placeholder="0.00"
              value={tip}
              onChange={(e) => setTip(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600' }}>
              Tax ($):
            </label>
            <input
              type="number"
              className="input"
              placeholder="0.00"
              value={tax}
              onChange={(e) => setTax(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button className="button button-secondary" onClick={prevStep}>
          Back
        </button>
        <button 
          className="button" 
          onClick={handleSubmit}
        >
          Continue
        </button>
      </div>
    </div>
  )
}

export default FeeInputPage 