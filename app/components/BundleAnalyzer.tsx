import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { Progress } from '~/components/ui/progress'
import { Badge } from '~/components/ui/badge'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Button } from '~/components/ui/button'
import { bundleAnalyzer, type BundleAnalysis } from '~/lib/bundleAnalyzer'
import { bundleOptimizationManager, optimizationUtils } from '~/lib/bundleOptimization'
import { formatBytes, formatDuration } from '~/lib/format'

interface BundleMetrics {
  bundleSize: number
  gzippedSize: number
  compressionRatio: number
  optimizationScore: number
}

export function BundleAnalyzer() {
  const [analysis, setAnalysis] = useState<BundleAnalysis | null>(null)
  const [metrics, setMetrics] = useState<BundleMetrics | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadAnalysis = async () => {
    setLoading(true)
    setError(null)

    try {
      const [analysisData, metricsData] = await Promise.all([
        bundleAnalyzer.analyzeBundle(),
        bundleOptimizationManager.getPerformanceMetrics()
      ])

      setAnalysis(analysisData)
      setMetrics(metricsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : '分析失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnalysis()
  }, [])

  const getOptimizationGrade = (score: number): { grade: string; color: string } => {
    if (score >= 90) return { grade: 'A', color: 'text-green-600' }
    if (score >= 80) return { grade: 'B', color: 'text-blue-600' }
    if (score >= 70) return { grade: 'C', color: 'text-yellow-600' }
    if (score >= 60) return { grade: 'D', color: 'text-orange-600' }
    return { grade: 'F', color: 'text-red-600' }
  }

  const getModuleTypeColor = (type: string): string => {
    switch (type) {
      case 'vendor': return 'bg-purple-100 text-purple-800'
      case 'app': return 'bg-blue-100 text-blue-800'
      case 'shared': return 'bg-green-100 text-green-800'
      case 'dynamic': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>包大小分析</CardTitle>
          <CardDescription>分析项目构建产物和依赖包大小</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">正在分析包大小...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>包大小分析</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              分析失败: {error}
              <Button variant="outline" size="sm" onClick={loadAnalysis} className="ml-2">
                重试
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (!analysis || !metrics) {
    return null
  }

  const { grade, color } = getOptimizationGrade(metrics.optimizationScore)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>包大小分析</CardTitle>
            <CardDescription>分析项目构建产物和依赖包大小</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={color} variant="secondary">
              优化等级: {grade}
            </Badge>
            <Button variant="outline" size="sm" onClick={loadAnalysis}>
              刷新分析
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">概览</TabsTrigger>
            <TabsTrigger value="modules">模块分析</TabsTrigger>
            <TabsTrigger value="dependencies">依赖分析</TabsTrigger>
            <TabsTrigger value="recommendations">优化建议</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{formatBytes(metrics.bundleSize)}</div>
                  <p className="text-sm text-gray-600">总包大小</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{formatBytes(metrics.gzippedSize)}</div>
                  <p className="text-sm text-gray-600">压缩后大小</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{(metrics.compressionRatio * 100).toFixed(1)}%</div>
                  <p className="text-sm text-gray-600">压缩率</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{metrics.optimizationScore}</div>
                  <p className="text-sm text-gray-600">优化得分</p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">优化进度</span>
                  <span className="text-sm text-gray-600">{metrics.optimizationScore}/100</span>
                </div>
                <Progress value={metrics.optimizationScore} className="w-full" />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">压缩效果</span>
                  <span className="text-sm text-gray-600">{(metrics.compressionRatio * 100).toFixed(1)}%</span>
                </div>
                <Progress value={metrics.compressionRatio * 100} className="w-full" />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="modules" className="space-y-4">
            <div className="space-y-3">
              {analysis.modules.map((module, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{module.name}</h4>
                        <Badge className={getModuleTypeColor(module.type)} variant="secondary">
                          {module.type}
                        </Badge>
                        {module.splittable && (
                          <Badge variant="outline">可分割</Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatBytes(module.size)}</div>
                        <div className="text-sm text-gray-600">{formatBytes(module.gzippedSize)}</div>
                      </div>
                    </div>

                    {module.optimizationPotential !== 'low' && (
                      <Alert>
                        <AlertDescription>
                          优化潜力: <span className="font-medium">{module.optimizationPotential}</span>
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="dependencies" className="space-y-4">
            <div className="space-y-3">
              {analysis.dependencies.slice(0, 10).map((dep, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{dep.name}</h4>
                        <Badge variant="outline">{dep.version}</Badge>
                        <Badge className={getPriorityColor(dep.usageFrequency)} variant="secondary">
                          {dep.usageFrequency}
                        </Badge>
                        {dep.replaceable && (
                          <Badge variant="destructive">可替换</Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatBytes(dep.size)}</div>
                        <div className="text-sm text-gray-600">
                          {dep.isDevDependency ? '开发依赖' : '生产依赖'}
                        </div>
                      </div>
                    </div>

                    {dep.alternatives && dep.alternatives.length > 0 && (
                      <Alert>
                        <AlertDescription>
                          <div>
                            <span className="font-medium">替代方案:</span>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {dep.alternatives.map((alt, altIndex) => (
                                <Badge key={altIndex} variant="outline" className="text-xs">
                                  {alt}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <div className="space-y-3">
              {analysis.recommendations.map((rec, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{rec.type.replace('-', ' ')}</h4>
                        <Badge className={getPriorityColor(rec.priority)} variant="secondary">
                          {rec.priority}
                        </Badge>
                        <Badge variant="outline">{rec.difficulty}</Badge>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-green-600">
                          节省 {formatBytes(rec.estimatedSavings)}
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-3">{rec.description}</p>

                    <div>
                      <h5 className="font-medium mb-2">实施步骤:</h5>
                      <ol className="text-sm text-gray-600 space-y-1">
                        {rec.steps.map((step, stepIndex) => (
                          <li key={stepIndex} className="flex items-start">
                            <span className="font-medium mr-2">{stepIndex + 1}.</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}