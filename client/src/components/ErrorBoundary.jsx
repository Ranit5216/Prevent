import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // Log error to Sentry in production
    if (import.meta.env.PROD && window.Sentry) {
      window.Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack
          }
        }
      })
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className='min-h-screen bg-[#F5F5F5] flex items-center justify-center p-4'>
          <div className='text-center max-w-md'>
            <h1 className='text-3xl font-bold text-[#DC2626] mb-4'>Oops! Something went wrong</h1>
            <p className='text-[#6B7280] mb-6'>We're sorry, but something unexpected happened. Please try refreshing the page.</p>
            <button 
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.reload()
              }} 
              className='bg-[#DC2626] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#991B1B] transition-colors'
            >
              Refresh Page
            </button>
            {this.state.error && (
              <details className='mt-4 text-left'>
                <summary className='cursor-pointer text-sm text-[#6B7280]'>Error Details</summary>
                <pre className='mt-2 text-xs bg-white p-4 rounded overflow-auto'>
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

