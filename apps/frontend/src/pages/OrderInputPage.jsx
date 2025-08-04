import React, { useState } from 'react'

const OrderInputPage = ({ orderData, setOrderData, nextStep, prevStep, currentStep, totalSteps }) => {
  const [manualItems, setManualItems] = useState([
    { id: 1, name: '', price: '', assignedTo: null }
  ])

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
      .filter(item => item.price > 0)

    if (items.length > 0) {
      setOrderData(prev => ({ ...prev, items }))
      nextStep()
    }
  }

  const handleKeyDown = (e, id, field) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      // Find current row index
      const currentIndex = manualItems.findIndex(item => item.id === id)
      
      if (field === 'name') {
        // Move to price column in same row
        const priceInput = document.querySelector(`input[data-id="${id}"][data-field="price"]`)
        if (priceInput) priceInput.focus()
      } else if (field === 'price') {
        // Move to next row or add new row
        if (currentIndex < manualItems.length - 1) {
          const nextRow = manualItems[currentIndex + 1]
          const nextNameInput = document.querySelector(`input[data-id="${nextRow.id}"][data-field="name"]`)
          if (nextNameInput) nextNameInput.focus()
        } else {
          addManualItem()
          // Focus on the new row after a brief delay
          setTimeout(() => {
            const newRow = manualItems[manualItems.length - 1]
            const newNameInput = document.querySelector(`input[data-id="${newRow.id}"][data-field="name"]`)
            if (newNameInput) newNameInput.focus()
          }, 100)
        }
      }
    } else if (e.key === 'Tab') {
      e.preventDefault()
      const currentIndex = manualItems.findIndex(item => item.id === id)
      
      if (field === 'name') {
        const priceInput = document.querySelector(`input[data-id="${id}"][data-field="price"]`)
        if (priceInput) priceInput.focus()
      } else if (field === 'price') {
        if (currentIndex < manualItems.length - 1) {
          const nextRow = manualItems[currentIndex + 1]
          const nextNameInput = document.querySelector(`input[data-id="${nextRow.id}"][data-field="name"]`)
          if (nextNameInput) nextNameInput.focus()
        } else {
          addManualItem()
          setTimeout(() => {
            const newRow = manualItems[manualItems.length - 1]
            const newNameInput = document.querySelector(`input[data-id="${newRow.id}"][data-field="name"]`)
            if (newNameInput) newNameInput.focus()
          }, 100)
        }
      }
    }
  }

  return (
    <div className="container">
      <h1 className="title">Enter Order Items</h1>
      <p className="subtitle">
        Add your Instacart items below. Use Tab or Enter to navigate between cells.
      </p>

      <div style={{ marginBottom: '30px' }}>
        <div style={{ 
          background: 'white', 
          borderRadius: '10px', 
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          {/* Excel-like header */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '50px 1fr 120px 80px',
            background: '#f8f9fa',
            borderBottom: '2px solid #dee2e6',
            fontWeight: '600',
            fontSize: '0.9rem',
            color: '#495057'
          }}>
            <div style={{ padding: '12px 8px', borderRight: '1px solid #dee2e6' }}>#</div>
            <div style={{ padding: '12px 8px', borderRight: '1px solid #dee2e6' }}>Item Name</div>
            <div style={{ padding: '12px 8px', borderRight: '1px solid #dee2e6' }}>Price ($)</div>
            <div style={{ padding: '12px 8px' }}>Actions</div>
          </div>

          {/* Excel-like rows */}
          {manualItems.map((item, index) => (
            <div key={item.id} style={{ 
              display: 'grid', 
              gridTemplateColumns: '50px 1fr 120px 80px',
              borderBottom: '1px solid #dee2e6',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              {/* Row number */}
              <div style={{ 
                padding: '12px 8px', 
                borderRight: '1px solid #dee2e6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.9rem',
                color: '#6c757d',
                background: '#f8f9fa'
              }}>
                {index + 1}
              </div>

              {/* Item name input */}
              <div style={{ padding: '8px', borderRight: '1px solid #dee2e6' }}>
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateManualItem(item.id, 'name', e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, item.id, 'name')}
                  data-id={item.id}
                  data-field="name"
                  placeholder="Enter item name..."
                  style={{
                    width: '100%',
                    border: 'none',
                    outline: 'none',
                    fontSize: '0.9rem',
                    background: 'transparent'
                  }}
                />
              </div>

              {/* Price input */}
              <div style={{ padding: '8px', borderRight: '1px solid #dee2e6' }}>
                <input
                  type="text"
                  value={item.price}
                  onChange={(e) => updateManualItem(item.id, 'price', e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, item.id, 'price')}
                  data-id={item.id}
                  data-field="price"
                  placeholder="0.00"
                  style={{
                    width: '100%',
                    border: 'none',
                    outline: 'none',
                    fontSize: '0.9rem',
                    background: 'transparent',
                    textAlign: 'right'
                  }}
                />
              </div>

              {/* Actions */}
              <div style={{ 
                padding: '8px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                {manualItems.length > 1 && (
                  <button
                    onClick={() => removeManualItem(item.id)}
                    style={{
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#c82333'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#dc3545'}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add row button */}
        <div style={{ marginTop: '15px', textAlign: 'center' }}>
          <button
            onClick={addManualItem}
            style={{
              background: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '10px 20px',
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#218838'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#28a745'}
          >
            + Add Row
          </button>
        </div>

        {/* Summary */}
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          background: '#f8f9fa', 
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>Total Items:</strong> {manualItems.filter(item => item.name.trim() || item.price).length}
            </div>
            <div>
              <strong>Total Price:</strong> ${manualItems
                .map(item => parsePrice(item.price))
                .reduce((sum, price) => sum + price, 0)
                .toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button className="button button-secondary" onClick={prevStep}>
          Back
        </button>
        <button 
          className="button" 
          onClick={handleManualSubmit}
          disabled={manualItems.filter(item => item.name.trim() || item.price).length === 0}
        >
          Continue
        </button>
      </div>
    </div>
  )
}

export default OrderInputPage 