import { useCallback } from "react";

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp?: number;
  userId?: string;
}

export function useAnalytics() {
  const trackEvent = useCallback((event: string, properties?: Record<string, any>) => {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        platform: 'web'
      },
      timestamp: Date.now()
    };

    // Log to console for development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics Event:', analyticsEvent);
    }

    // Store in localStorage for later processing
    try {
      const existingEvents = JSON.parse(localStorage.getItem('analytics_events') || '[]');
      existingEvents.push(analyticsEvent);
      
      // Keep only last 100 events to prevent storage overflow
      const recentEvents = existingEvents.slice(-100);
      localStorage.setItem('analytics_events', JSON.stringify(recentEvents));
    } catch (error) {
      console.warn('Failed to store analytics event:', error);
    }

    // TODO: Send to analytics service (e.g., PostHog, Mixpanel, Google Analytics)
    // Example:
    // analytics.track(event, properties);
  }, []);

  const trackConversion = useCallback((type: 'signup' | 'upgrade' | 'trial_start', properties?: Record<string, any>) => {
    trackEvent(`conversion_${type}`, {
      ...properties,
      conversion_type: type,
      is_conversion: true
    });
  }, [trackEvent]);

  const trackUpgradeFlow = useCallback((step: string, properties?: Record<string, any>) => {
    trackEvent('upgrade_flow', {
      ...properties,
      flow_step: step,
      flow_type: 'freemium_upgrade'
    });
  }, [trackEvent]);

  const trackTokenUsage = useCallback((tokensUsed: number, tokensLimit: number, userPlan: string) => {
    const usagePercentage = (tokensUsed / tokensLimit) * 100;
    
    trackEvent('token_usage', {
      tokens_used: tokensUsed,
      tokens_limit: tokensLimit,
      usage_percentage: usagePercentage,
      user_plan: userPlan,
      is_near_limit: usagePercentage >= 80,
      is_exceeded: tokensUsed >= tokensLimit
    });
  }, [trackEvent]);

  const trackAgentUsage = useCallback((agentCount: number, maxAgents: number, userPlan: string) => {
    const usagePercentage = (agentCount / maxAgents) * 100;
    
    trackEvent('agent_usage', {
      agent_count: agentCount,
      max_agents: maxAgents,
      usage_percentage: usagePercentage,
      user_plan: userPlan,
      is_near_limit: agentCount >= maxAgents - 1,
      is_at_limit: agentCount >= maxAgents
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackConversion,
    trackUpgradeFlow,
    trackTokenUsage,
    trackAgentUsage
  };
}