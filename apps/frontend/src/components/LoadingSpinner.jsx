import React from 'react'

const LoadingSpinner = ({ message = 'Loading...', size = 'medium' }) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        width: size === 'small' ? '24px' : size === 'large' ? '48px' : '32px',
        height: size === 'small' ? '24px' : size === 'large' ? '48px' : '32px',
        border: '3px solid #f3f3f3',
        borderTop: '3px solid #667eea',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '15px'
      }}></div>
      
      {message && (
        <p style={{ 
          color: '#666', 
          fontSize: '1rem',
          margin: '0',
          textAlign: 'center'
        }}>
          {message}
        </p>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default LoadingSpinner 