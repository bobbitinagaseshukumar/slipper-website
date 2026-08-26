import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught Error in React Application:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-luxury-warmWhite p-4 text-center">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl border border-gray-100 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="font-display font-black text-2xl text-luxury-dark">
              AuraSole Experience Notice
            </h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              {this.state.error?.message || 'Something went wrong while rendering this page.'}
            </p>
            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="py-2.5 px-5 rounded-xl bg-luxury-dark text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-luxury-accent transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reload Page
              </button>
              <a
                href="/"
                className="py-2.5 px-5 rounded-xl bg-gray-100 text-gray-700 text-xs font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
              >
                <Home className="w-3.5 h-3.5" /> Return to Store
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
