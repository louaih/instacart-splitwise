import React, { useState } from 'react'

const OrderInputPage = ({ orderData, setOrderData, nextStep, prevStep, currentStep, totalSteps }) => {
  const [orderInput, setOrderInput] = useState('')
  const [inputMethod, setInputMethod] = useState('manual') // 'link' or 'manual'
  const [manualItems, setManualItems] = useState([
    { id: 1, name: '', price: '', assignedTo: null }
  ])

  const parseOrderFromText = (text) => {
    // Mock parsing - in real app, this would parse Instacart order text
    const lines = text.split('\n').filter(line => line.trim())
    const items = lines.map((line, index) => {
      // Simple parsing - assumes format: "Item Name - $X.XX"
      const match = line.match(/(.+?)\s*-\s*\$\s*(\d+\.?\d*)/)
      if (match) {
        return {
          id: index,
          name: match[1].trim(),
          price: parseFloat(match[2]),
          assignedTo: null
        }
      } else {
        // Fallback: treat as item name with random price
        return {
          id: index,
          name: line.trim(),
          price: Math.random() * 20 + 5, // Random price between $5-$25
          assignedTo: null
        }
      }
    })
    return items
  }

  const addManualItem = () => {
    const newId = Math.max(...manualItems.map(item => item.id), 0) + 1
    setManualItems([...manualItems, { id: newId, name: '', price: '', assignedTo: null }])
  }

  const removeManualItem = (id) => {
    if (manualItems.length > 1) {
      setManualItems(manualItems.filter(item => item.id !== id))
    }
  }

  const updateManualItem = (id, field, value) => {
    setManualItems(manualItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ))
  }

  const parsePrice = (priceStr) => {
    if (!priceStr) return 0
    // Remove any non-numeric characters except decimal point
    const cleanPrice = priceStr.replace(/[^\d.]/g, '')
    const parsed = parseFloat(cleanPrice)
    return isNaN(parsed) ? 0 : parsed
  }

  const handleManualSubmit = () => {
    const items = manualItems
      .filter(item => item.name.trim() || item.price)
      .map((item, index) => ({
        id: index,
        name: item.name.trim() || `Item ${index + 1}`,
        price: parsePrice(item.price),
        assignedTo: null
      }))
      .filter(item => item.price > 0) // Only include items with valid prices

    if (items.length > 0) {
      setOrderData(prev => ({ ...prev, items }))
      nextStep()
    }
  }

  const handleSubmit = () => {
    if (inputMethod === 'manual') {
      handleManualSubmit()
    } else if (inputMethod === 'link' && orderInput.trim()) {
      // Mock: simulate parsing from link
      const mockItems = [
        { id: 1, name: 'Organic Bananas', price: 3.99, assignedTo: null },
        { id: 2, name: 'Whole Milk', price: 4.49, assignedTo: null },
        { id: 3, name: 'Chicken Breast', price: 12.99, assignedTo: null },
        { id: 4, name: 'Bread', price: 2.99, assignedTo: null },
        { id: 5, name: 'Eggs', price: 5.99, assignedTo: null }
      ]
      setOrderData(prev => ({ ...prev, items: mockItems }))
      nextStep()
    }
  }

  const canProceedManual = manualItems.some(item => item.name.trim() || item.price)
  const canProceedLink = orderInput.trim().length > 0
  const canProceed = inputMethod === 'manual' ? canProceedManual : canProceedLink

  return (
    <div className="container">
      <h1 className="title">Order Details</h1>
      <p className="subtitle">
        Paste your Instacart order details or enter items manually
      </p>

      <div style={{ marginBottom: '30px' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600' }}>
            Input Method:
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className={`button ${inputMethod === 'link' ? '' : 'button-secondary'}`}
              onClick={() => setInputMethod('link')}
              style={{ flex: 1 }}
            >
              Instacart Link
            </button>
            <button
              className={`button ${inputMethod === 'manual' ? '' : 'button-secondary'}`}
              onClick={() => setInputMethod('manual')}
              style={{ flex: 1 }}
            >
              Manual Entry
            </button>
          </div>
        </div>

        {inputMethod === 'link' ? (
          <div>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600' }}>
              Instacart Order Link:
            </label>
            <input
              type="url"
              className="input"
              placeholder="https://www.instacart.com/orders/..."
              value={orderInput}
              onChange={(e) => setOrderInput(e.target.value)}
            />
            <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '10px' }}>
              Note: For demo purposes, any link will generate sample items
            </p>
          </div>
        ) : (
          <div>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600' }}>
              Order Items:
            </label>
            <div style={{ 
              background: '#f8f9fa', 
              borderRadius: '10px', 
              padding: '20px',
              marginBottom: '15px'
            }}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 120px 40px', 
                gap: '10px',
                marginBottom: '10px',
                fontWeight: '600',
                fontSize: '0.9rem',
                color: '#666'
              }}>
                <div>Item Name</div>
                <div>Price</div>
                <div></div>
              </div>
              {manualItems.map((item, index) => (
                <div key={item.id} style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 120px 40px', 
                  gap: '10px',
                  marginBottom: '10px',
                  alignItems: 'center'
                }}>
                  <input
                    type="text"
                    className="input"
                    placeholder={`Item ${index + 1}`}
                    value={item.name}
                    onChange={(e) => updateManualItem(item.id, 'name', e.target.value)}
                    style={{ marginBottom: '0' }}
                  />
                  <input
                    type="text"
                    className="input"
                    placeholder="0.00"
                    value={item.price}
                    onChange={(e) => updateManualItem(item.id, 'price', e.target.value)}
                    style={{ marginBottom: '0' }}
                  />
                  <button
                    onClick={() => removeManualItem(item.id)}
                    disabled={manualItems.length === 1}
                    style={{
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      padding: '8px',
                      cursor: manualItems.length === 1 ? 'not-allowed' : 'pointer',
                      opacity: manualItems.length === 1 ? 0.5 : 1
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                className="button"
                onClick={addManualItem}
                style={{ 
                  marginTop: '10px',
                  fontSize: '0.9rem',
                  padding: '8px 16px'
                }}
              >
                + Add Item
              </button>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#666' }}>
              Enter item names and prices. Prices can include dollar signs or just numbers.
            </p>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button className="button button-secondary" onClick={prevStep}>
          Back
        </button>
        <button 
          className="button" 
          onClick={handleSubmit}
          disabled={!canProceed}
        >
          Continue
        </button>
      </div>
    </div>
  )
}

export default OrderInputPage 