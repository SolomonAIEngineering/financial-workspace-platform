import type { Metric } from './metric-schema'

export interface Metrics {
  /**
   * Emit stores a new metric event
   */
  emit(metric: Metric): void

  /**
   * flush persists all metrics to durable storage
   */
  flush(): Promise<void>
}
