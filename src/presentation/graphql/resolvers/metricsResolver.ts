import { performanceMetrics } from '@/infrastructure/metrics/PerformanceMetrics';

export const metricsResolvers = {
  Query: {
    cacheMetrics: () => {
      return performanceMetrics.getCacheMetrics();
    },
    queryMetrics: () => {
      return performanceMetrics.getQueryMetrics();
    },
    metricsSummary: () => {
      return performanceMetrics.getMetricsSummary();
    },
    resetMetrics: () => {
      performanceMetrics.reset();
      return {
        success: true,
        message: 'Metrics have been reset',
      };
    },
  },
};
