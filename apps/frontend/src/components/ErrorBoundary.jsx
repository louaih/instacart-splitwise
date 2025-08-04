import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
    
    // Log error to console for debugging
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container">
          <h1 className="title" style={{ color: '#dc3545' }}>Something went wrong</h1>
          <p className="subtitle">
            We encountered an unexpected error. Please try refreshing the page.
          </p>
          
          <div style={{ 
            background: '#f8f9fa', 
            padding: '20px', 
            borderRadius: '10px',
            marginBottom: '20px',
            textAlign: 'left'
          }}>
            <h3 style={{ color: '#333', marginBottom: '10px' }}>Error Details:</h3>
            <details style={{ fontSize: '0.9rem' }}>
              <summary>Click to see error details</summary>
              <pre style={{ 
                background: '#fff', 
                padding: '10px', 
                borderRadius: '5px',
                overflow: 'auto',
                fontSize: '0.8rem'
              }}>
                {this.state.error && this.state.error.toString()}
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </details>
          </div>

          <button 
            className="button" 
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary 