import React, { useState } from 'react'

const OrderReviewPage = ({ orderData, setOrderData, nextStep, prevStep, currentStep, totalSteps }) => {
  const [newPerson, setNewPerson] = useState('')
  const [people, setPeople] = useState(['Me', 'Roommate', 'Partner'])

  const addPerson = () => {
    if (newPerson.trim() && !people.includes(newPerson.trim())) {
      setPeople([...people, newPerson.trim()])
      setNewPerson('')
    }
  }

  const removePerson = (personToRemove) => {
    if (people.length > 1) {
      setPeople(people.filter(p => p !== personToRemove))
      // Remove assignments for this person
      setOrderData(prev => ({
        ...prev,
        items: prev.items.map(item => 
          item.assignedTo === personToRemove ? { ...item, assignedTo: null } : item
        )
      }))
    }
  }

  const assignItem = (itemId, person) => {
    setOrderData(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId ? { ...item, assignedTo: person } : item
      )
    }))
  }

  const totalAssigned = orderData.items.filter(item => item.assignedTo).length
  const totalItems = orderData.items.length

  return (
    <div className="container">
      <h1 className="title">Review & Assign Items</h1>
      <p className="subtitle">
        Assign each item to a person. You can add or remove people as needed.
      </p>

      {/* People Management */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#333', marginBottom: '15px' }}>People:</h3>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
          {people.map(person => (
            <div key={person} style={{ 
              background: '#667eea', 
              color: 'white', 
              padding: '8px 15px', 
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span>{person}</span>
              {people.length > 1 && (
                <button
                  onClick={() => removePerson(person)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    padding: '0',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            className="input"
            placeholder="Add new person..."
            value={newPerson}
            onChange={(e) => setNewPerson(e.target.value)}
            style={{ flex: 1, marginBottom: '0' }}
          />
          <button 
            className="button" 
            onClick={addPerson}
            disabled={!newPerson.trim() || people.includes(newPerson.trim())}
            style={{ margin: '0' }}
          >
            Add
          </button>
        </div>
      </div>

      {/* Items List */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#333', marginBottom: '15px' }}>
          Items ({totalAssigned}/{totalItems} assigned):
        </h3>
        {orderData.items.map(item => (
          <div key={item.id} className="item-card">
            <div className="item-header">
              <span className="item-name">{item.name}</span>
              <span className="item-price">${item.price.toFixed(2)}</span>
            </div>
            <div className="item-assignment">
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>
                Assigned to:
              </label>
              <select
                className="person-select"
                value={item.assignedTo || ''}
                onChange={(e) => assignItem(item.id, e.target.value || null)}
              >
                <option value="">Select person...</option>
                {people.map(person => (
                  <option key={person} value={person}>
                    {person}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button className="button button-secondary" onClick={prevStep}>
          Back
        </button>
        <button 
          className="button" 
          onClick={nextStep}
          disabled={totalAssigned === 0}
        >
          Continue
        </button>
      </div>
    </div>
  )
}

export default OrderReviewPage 