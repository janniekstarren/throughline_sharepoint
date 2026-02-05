// ============================================
// ErrorBoundary - Catches React render errors
// Prevents entire UI from crashing when a component fails
// ============================================

import * as React from 'react';
import { Text, Button, tokens } from '@fluentui/react-components';
import { ErrorCircle24Regular, ArrowClockwiseRegular } from '@fluentui/react-icons';

interface ErrorBoundaryProps {
  /** Component name for error display */
  componentName?: string;
  /** Fallback render function */
  fallback?: (error: Error, resetError: () => void) => React.ReactNode;
  /** Children to render */
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  resetError = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error!, this.resetError);
      }

      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: tokens.spacingVerticalL,
            gap: tokens.spacingVerticalM,
            backgroundColor: tokens.colorNeutralBackground1,
            borderRadius: tokens.borderRadiusMedium,
            border: `1px solid ${tokens.colorPaletteRedBorder2}`,
            minHeight: '120px',
          }}
        >
          <ErrorCircle24Regular style={{ color: tokens.colorPaletteRedForeground1 }} />
          <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
            {this.props.componentName
              ? `Failed to load ${this.props.componentName}`
              : 'Something went wrong'}
          </Text>
          <Button
            appearance="subtle"
            size="small"
            icon={<ArrowClockwiseRegular />}
            onClick={this.resetError}
          >
            Retry
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
