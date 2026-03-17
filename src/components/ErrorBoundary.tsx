import React, { Component, ReactNode } from 'react';
import { logError } from '@/services/errorLogger';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log error to database
        logError(
            'React Error Boundary caught an error',
            error,
            {
                componentStack: errorInfo.componentStack,
                errorBoundary: true,
            }
        );

        // Also log to console in development
        if (import.meta.env.DEV) {
            console.error('Error Boundary caught error:', error, errorInfo);
        }
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
        });
    };

    render() {
        if (this.state.hasError) {
            // Use custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default error UI
            return (
                <div className="min-h-screen flex items-center justify-center p-4 font-sans">
                    <Card className="max-w-lg w-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-destructive">
                                <AlertTriangle className="h-5 w-5" />
                                Something went wrong
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">
                                We're sorry, but something unexpected happened. The error has been logged and our team will look into it.
                            </p>

                            {import.meta.env.DEV && this.state.error && (
                                <div className="p-3 bg-muted rounded-lg">
                                    <p className="font-mono text-xs text-destructive break-all">
                                        {this.state.error.message}
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-2">
                                <Button onClick={this.handleReset} variant="default">
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Try Again
                                </Button>
                                <Button
                                    onClick={() => window.location.href = '/'}
                                    variant="outline"
                                >
                                    Go Home
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}
