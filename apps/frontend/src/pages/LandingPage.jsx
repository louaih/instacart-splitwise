import React from 'react'

const LandingPage = ({ nextStep, currentStep, totalSteps }) => {
  return (
    <div className="container">
      <h1 className="title">Instacart Splitwise</h1>
      <p className="subtitle">
        Split your Instacart orders with friends and family automatically. 
        Just paste your order details and we'll handle the rest!
      </p>
      
      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ color: '#333', marginBottom: '20px' }}>How it works:</h3>
        <div style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
          <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
            <span style={{ 
              background: '#667eea', 
              color: 'white', 
              borderRadius: '50%', 
              width: '30px', 
              height: '30px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              marginRight: '15px',
              fontWeight: 'bold'
            }}>1</span>
            <span>Paste your Instacart order details</span>
          </div>
          <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
            <span style={{ 
              background: '#667eea', 
              color: 'white', 
              borderRadius: '50%', 
              width: '30px', 
              height: '30px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              marginRight: '15px',
              fontWeight: 'bold'
            }}>2</span>
            <span>Assign items to people</span>
          </div>
          <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
            <span style={{ 
              background: '#667eea', 
              color: 'white', 
              borderRadius: '50%', 
              width: '30px', 
              height: '30px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              marginRight: '15px',
              fontWeight: 'bold'
            }}>3</span>
            <span>Add delivery fees and tax</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ 
              background: '#667eea', 
              color: 'white', 
              borderRadius: '50%', 
              width: '30px', 
              height: '30px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              marginRight: '15px',
              fontWeight: 'bold'
            }}>4</span>
            <span>Send split requests to Splitwise</span>
          </div>
        </div>
      </div>

      <button className="button" onClick={nextStep}>
        Start Order
      </button>
    </div>
  )
}

export default LandingPage 