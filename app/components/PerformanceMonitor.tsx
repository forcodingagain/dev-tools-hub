import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { Progress } from '~/components/ui/progress'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '~/components/ui/tabs'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { usePerformance } from '~/hooks/usePerformance'
import { formatBytes, formatDuration } from '~/lib/format'

interface PerformanceMonitorProps {
  enabled?: boolean
  showDetails?: boolean
}

export function PerformanceMonitor({ enabled = true, showDetails = false }: PerformanceMonitorProps) {
  const [showPanel, setShowPanel] = useState(false)
  const { metrics, score, report, generateReport, isMonitoring } = usePerformance(enabled)

  if (!enabled) {
    return null
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreVariant = (score: number) => {
    if (score >= 80) return 'default'
    if (score >= 60) return 'secondary'
    return 'destructive'
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!showPanel ? (
        <Card className="w-64 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">性能监控</span>
              <Badge variant={isMonitoring ? 'default' : 'secondary'}>
                {isMonitoring ? '监控中' : '已停止'}
              </Badge>
            </div>

            {score && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">总体评分</span>
                  <span className={`text-sm font-bold ${getScoreColor(score.overall)}`}>
                    {score.overall}/100
                  </span>
                </div>
                <Progress value={score.overall} className="h-2" />
              </div>
            )}

            <div className="mt-3 flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowPanel(true)}
                className="flex-1"
              >
                详细信息
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={generateReport}
                className="flex-1"
              >
                生成报告
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="w-96 shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">性能监控面板</CardTitle>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowPanel(false)}
              >
                ✕
              </Button>
            </div>
            <CardDescription>
              实时性能指标和优化建议
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">概览</TabsTrigger>
                <TabsTrigger value="metrics">指标</TabsTrigger>
                <TabsTrigger value="recommendations">建议</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                {score && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className={`text-2xl font-bold ${getScoreColor(score.overall)}`}>
                        {score.overall}
                      </div>
                      <div className="text-xs text-gray-600">总体评分</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className={`text-2xl font-bold ${getScoreColor(score.loading)}`}>
                        {score.loading}
                      </div>
                      <div className="text-xs text-gray-600">加载性能</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className={`text-2xl font-bold ${getScoreColor(score.interactivity)}`}>
                        {score.interactivity}
                      </div>
                      <div className="text-xs text-gray-600">交互响应</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className={`text-2xl font-bold ${getScoreColor(score.runtime)}`}>
                        {score.runtime}
                      </div>
                      <div className="text-xs text-gray-600">运行稳定性</div>
                    </div>
                  </div>
                )}

                {metrics?.memoryUsage && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-900">内存使用</span>
                      <Badge variant="outline" className="text-blue-600">
                        {((metrics.memoryUsage.usedJSHeapSize / metrics.memoryUsage.jsHeapSizeLimit) * 100).toFixed(1)}%
                      </Badge>
                    </div>
                    <Progress
                      value={(metrics.memoryUsage.usedJSHeapSize / metrics.memoryUsage.jsHeapSizeLimit) * 100}
                      className="h-2"
                    />
                    <div className="mt-1 text-xs text-blue-700">
                      {formatBytes(metrics.memoryUsage.usedJSHeapSize)} / {formatBytes(metrics.memoryUsage.jsHeapSizeLimit)}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="metrics" className="space-y-3">
                {metrics && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-600">页面加载时间</div>
                        <div className="text-lg font-semibold">
                          {formatDuration(metrics.pageLoadTime)}
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-600">首次内容绘制</div>
                        <div className="text-lg font-semibold">
                          {formatDuration(metrics.firstContentfulPaint)}
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-600">最大内容绘制</div>
                        <div className="text-lg font-semibold">
                          {formatDuration(metrics.largestContentfulPaint)}
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-600">首次输入延迟</div>
                        <div className="text-lg font-semibold">
                          {formatDuration(metrics.firstInputDelay)}
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-600 mb-1">累计布局偏移</div>
                      <div className="text-lg font-semibold">
                        {metrics.cumulativeLayoutShift.toFixed(3)}
                      </div>
                    </div>

                    {showDetails && metrics.operationMetrics && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">操作性能</h4>
                        {Object.entries(metrics.operationMetrics).map(([type, operation]) => (
                          <div key={type} className="p-2 bg-gray-50 rounded">
                            <div className="flex justify-between items-center">
                              <span className="text-xs capitalize">{type.replace('_', ' ')}</span>
                              <span className="text-xs font-medium">
                                {formatDuration(operation.duration)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-3">
                {report?.recommendations.length ? (
                  report.recommendations.map((rec, index) => (
                    <Alert key={index} className={
                      rec.type === 'critical' ? 'border-red-200 bg-red-50' :
                      rec.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                      'border-blue-200 bg-blue-50'
                    }>
                      <AlertDescription>
                        <div className="space-y-2">
                          <div className="font-medium text-sm">{rec.title}</div>
                          <div className="text-xs text-gray-600">{rec.description}</div>
                          {rec.suggestions.length > 0 && (
                            <div className="mt-2">
                              <div className="text-xs font-medium mb-1">建议:</div>
                              <ul className="text-xs text-gray-600 space-y-1">
                                {rec.suggestions.map((suggestion, i) => (
                                  <li key={i} className="flex items-start">
                                    <span className="mr-1">•</span>
                                    <span>{suggestion}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-sm">暂无优化建议</div>
                    <div className="text-xs mt-1">性能表现良好</div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}