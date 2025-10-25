/**
 * 包大小分析工具
 */

export interface BundleAnalysis {
  /** 总大小 */
  totalSize: number
  /** 压缩后大小 */
  gzippedSize: number
  /** 模块分析 */
  modules: ModuleAnalysis[]
  /** 依赖分析 */
  dependencies: DependencyAnalysis[]
  /** 优化建议 */
  recommendations: BundleOptimization[]
  /** 分析时间 */
  timestamp: number
}

export interface ModuleAnalysis {
  /** 模块名称 */
  name: string
  /** 原始大小 */
  size: number
  /** 压缩大小 */
  gzippedSize: number
  /** 模块类型 */
  type: 'vendor' | 'app' | 'shared' | 'dynamic'
  /** 是否可分割 */
  splittable: boolean
  /** 依赖关系 */
  dependencies: string[]
  /** 优化潜力 */
  optimizationPotential: 'high' | 'medium' | 'low'
}

export interface DependencyAnalysis {
  /** 包名 */
  name: string
  /** 版本 */
  version: string
  /** 大小 */
  size: number
  /** 是否为开发依赖 */
  isDevDependency: boolean
  /** 使用频率 */
  usageFrequency: 'high' | 'medium' | 'low'
  /** 是否可替代 */
  replaceable: boolean
  /** 替代方案 */
  alternatives?: string[]
}

export interface BundleOptimization {
  /** 优化类型 */
  type: 'tree-shaking' | 'code-splitting' | 'lazy-loading' | 'compression' | 'dependency-replacement'
  /** 优化描述 */
  description: string
  /** 预估节省大小 */
  estimatedSavings: number
  /** 实施难度 */
  difficulty: 'easy' | 'medium' | 'hard'
  /** 优先级 */
  priority: 'high' | 'medium' | 'low'
  /** 实施步骤 */
  steps: string[]
}

/**
 * 包大小分析器
 */
export class BundleAnalyzer {
  private static instance: BundleAnalyzer
  private analysisCache = new Map<string, BundleAnalysis>()

  static getInstance(): BundleAnalyzer {
    if (!BundleAnalyzer.instance) {
      BundleAnalyzer.instance = new BundleAnalyzer()
    }
    return BundleAnalyzer.instance
  }

  /**
   * 分析当前构建
   */
  async analyzeBundle(): Promise<BundleAnalysis> {
    const cacheKey = 'current-bundle'

    if (this.analysisCache.has(cacheKey)) {
      return this.analysisCache.get(cacheKey)!
    }

    try {
      // 获取构建文件信息
      const buildInfo = await this.getBuildInfo()

      // 分析依赖
      const dependencies = await this.analyzeDependencies()

      // 分析模块
      const modules = await this.analyzeModules(buildInfo)

      // 生成优化建议
      const recommendations = await this.generateRecommendations(modules, dependencies)

      const analysis: BundleAnalysis = {
        totalSize: buildInfo.totalSize,
        gzippedSize: buildInfo.gzippedSize,
        modules,
        dependencies,
        recommendations,
        timestamp: Date.now()
      }

      this.analysisCache.set(cacheKey, analysis)
      return analysis

    } catch (error) {
      console.error('Bundle analysis failed:', error)
      throw error
    }
  }

  /**
   * 获取构建信息
   */
  private async getBuildInfo(): Promise<{
    totalSize: number
    gzippedSize: number
    modules: Array<{ name: string; size: number }>
  }> {
    // 简化实现，实际应该读取metafile等构建产物
    return {
      totalSize: 150 * 1024, // 150KB
      gzippedSize: 45 * 1024, // 45KB gzipped
      modules: [
        { name: 'index.js', size: 150 * 1024 },
        { name: 'vendor.js', size: 800 * 1024 },
        { name: 'shared.js', size: 120 * 1024 }
      ]
    }
  }

  /**
   * 分析依赖
   */
  private async analyzeDependencies(): Promise<DependencyAnalysis[]> {
    const packageJson = await this.fetchPackageJson()
    const dependencies: DependencyAnalysis[] = []

    // 分析生产依赖
    for (const [name, version] of Object.entries(packageJson.dependencies || {})) {
      const analysis = await this.analyzeDependency(name, version as string, false)
      dependencies.push(analysis)
    }

    // 分析开发依赖
    for (const [name, version] of Object.entries(packageJson.devDependencies || {})) {
      const analysis = await this.analyzeDependency(name, version as string, true)
      dependencies.push(analysis)
    }

    return dependencies.sort((a, b) => b.size - a.size)
  }

  private async analyzeDependency(name: string, version: string, isDevDependency: boolean): Promise<DependencyAnalysis> {
    // 获取包大小信息（简化实现）
    const size = await this.getPackageSize(name)

    return {
      name,
      version,
      size,
      isDevDependency,
      usageFrequency: this.estimateUsageFrequency(name),
      replaceable: this.isReplaceable(name),
      alternatives: this.getAlternatives(name)
    }
  }

  private async getPackageSize(packageName: string): Promise<number> {
    // 简化的大小估算，实际应该调用bundlephobia等API
    const sizeMap: Record<string, number> = {
      'react': 45000,
      'react-dom': 130000,
      'mermaid': 250000,
      'html2canvas': 200000,
      'showdown': 50000,
      '@remix-run/react': 25000,
      '@remix-run/node': 30000,
      'tailwindcss': 12000,
      'lucide-react': 150000,
      '@radix-ui/react-slot': 5000,
      '@radix-ui/react-tabs': 8000,
      '@radix-ui/react-progress': 6000,
      '@radix-ui/react-toast': 10000
    }

    return sizeMap[packageName] || 10000
  }

  private estimateUsageFrequency(packageName: string): 'high' | 'medium' | 'low' {
    const highUsage = ['react', 'react-dom', '@remix-run/react']
    const mediumUsage = ['lucide-react', 'clsx', 'tailwind-merge']

    if (highUsage.includes(packageName)) return 'high'
    if (mediumUsage.includes(packageName)) return 'medium'
    return 'low'
  }

  private isReplaceable(packageName: string): boolean {
    const replaceablePackages = [
      'lucide-react', // 可以用更小的图标库替代
      'html2canvas', // 可以用原生Canvas API
      'showdown' // 可以用markdown-it等更小的库
    ]

    return replaceablePackages.includes(packageName)
  }

  private getAlternatives(packageName: string): string[] {
    const alternatives: Record<string, string[]> = {
      'lucide-react': ['react-icons', 'phosphor-react', 'heroicons'],
      'html2canvas': ['native-canvas', 'canvas2html'],
      'showdown': ['markdown-it', 'marked', 'remark'],
      'clsx': ['classnames'],
      'tailwind-merge': ['clsx-tailwind']
    }

    return alternatives[packageName] || []
  }

  /**
   * 分析模块
   */
  private async analyzeModules(buildInfo: any): Promise<ModuleAnalysis[]> {
    const modules: ModuleAnalysis[] = []

    // 分析主要模块
    for (const module of buildInfo.modules) {
      const analysis: ModuleAnalysis = {
        name: module.name,
        size: module.size,
        gzippedSize: Math.floor(module.size * 0.3), // 估算gzip压缩后的大小
        type: this.determineModuleType(module.name),
        splittable: this.isSplittable(module.name),
        dependencies: [], // 简化实现
        optimizationPotential: this.estimateOptimizationPotential(module.name, module.size)
      }

      modules.push(analysis)
    }

    return modules.sort((a, b) => b.size - a.size)
  }

  private determineModuleType(moduleName: string): 'vendor' | 'app' | 'shared' | 'dynamic' {
    if (moduleName.includes('vendor') || moduleName.includes('node_modules')) {
      return 'vendor'
    }
    if (moduleName.includes('shared')) {
      return 'shared'
    }
    if (moduleName.includes('lazy') || moduleName.includes('async')) {
      return 'dynamic'
    }
    return 'app'
  }

  private isSplittable(moduleName: string): boolean {
    // 供应商代码通常已经在单独的chunk中
    if (moduleName.includes('vendor')) return false

    // 动态导入的模块可以分割
    if (moduleName.includes('lazy') || moduleName.includes('async')) return true

    // 大型工具库可以分割
    const splittableLibraries = ['mermaid', 'html2canvas', 'showdown']
    return splittableLibraries.some(lib => moduleName.includes(lib))
  }

  private estimateOptimizationPotential(moduleName: string, size: number): 'high' | 'medium' | 'low' {
    if (size > 200 * 1024) return 'high' // 大于200KB有高优化潜力
    if (size > 50 * 1024) return 'medium' // 大于50KB有中等优化潜力
    return 'low'
  }

  /**
   * 生成优化建议
   */
  private async generateRecommendations(
    modules: ModuleAnalysis[],
    dependencies: DependencyAnalysis[]
  ): Promise<BundleOptimization[]> {
    const recommendations: BundleOptimization[] = []

    // 代码分割建议
    const largeModules = modules.filter(m => m.splittable && m.size > 50 * 1024)
    for (const module of largeModules) {
      recommendations.push({
        type: 'code-splitting',
        description: `将大型模块 ${module.name} 分割成独立的chunk，实现懒加载`,
        estimatedSavings: Math.floor(module.size * 0.8),
        difficulty: 'medium',
        priority: 'high',
        steps: [
          `识别 ${module.name} 的使用位置`,
          '创建动态导入包装器',
          '配置Remix的懒加载路由',
          '添加加载状态处理'
        ]
      })
    }

    // 依赖替换建议
    const replaceableDeps = dependencies.filter(d => d.replaceable && !d.isDevDependency)
    for (const dep of replaceableDeps) {
      if (dep.alternatives && dep.alternatives.length > 0) {
        recommendations.push({
          type: 'dependency-replacement',
          description: `用更小的替代方案替换 ${dep.name}`,
          estimatedSavings: Math.floor(dep.size * 0.6),
          difficulty: 'medium',
          priority: dep.size > 100000 ? 'high' : 'medium',
          steps: [
            `评估替代方案: ${dep.alternatives.join(', ')}`,
            '创建兼容性测试',
            '逐步替换依赖',
            '验证功能完整性'
          ]
        })
      }
    }

    // Tree shaking建议
    recommendations.push({
      type: 'tree-shaking',
      description: '优化导入方式，确保只打包实际使用的代码',
      estimatedSavings: Math.floor(modules.reduce((sum, m) => sum + m.size, 0) * 0.1),
      difficulty: 'easy',
      priority: 'medium',
      steps: [
        '检查所有导入语句',
        '使用具名导入替代默认导入',
        '配置webpack/remix的tree shaking',
        '移除未使用的代码'
      ]
    })

    // 压缩建议
    recommendations.push({
      type: 'compression',
      description: '启用Brotli压缩以进一步减少传输大小',
      estimatedSavings: Math.floor(modules.reduce((sum, m) => sum + m.gzippedSize, 0) * 0.2),
      difficulty: 'easy',
      priority: 'high',
      steps: [
        '配置服务器启用Brotli压缩',
        '设置适当的压缩级别',
        '测试压缩效果',
        '监控压缩性能影响'
      ]
    })

    return recommendations.sort((a, b) => {
      const priorityWeight = { high: 3, medium: 2, low: 1 }
      const aWeight = priorityWeight[a.priority]
      const bWeight = priorityWeight[b.priority]
      if (aWeight !== bWeight) return bWeight - aWeight
      return b.estimatedSavings - a.estimatedSavings
    })
  }

  /**
   * 获取package.json内容
   */
  private async fetchPackageJson(): Promise<any> {
    try {
      const response = await fetch('/api/package-info')
      return response.json()
    } catch {
      // 返回已知的package.json内容作为fallback
      return {
        dependencies: {
          "react": "^18.3.1",
          "react-dom": "^18.3.1",
          "mermaid": "^10.6.1",
          "html2canvas": "^1.4.1",
          "showdown": "^2.1.0",
          "lucide-react": "^0.546.0",
          "@radix-ui/react-slot": "^1.2.3",
          "@radix-ui/react-tabs": "^1.1.13",
          "@radix-ui/react-progress": "^1.1.7",
          "@radix-ui/react-toast": "^1.2.15",
          "clsx": "^2.1.1",
          "tailwind-merge": "^3.3.1"
        },
        devDependencies: {
          "@remix-run/dev": "^2.17.1",
          "typescript": "^5.3.3",
          "tailwindcss": "^3.4.17"
        }
      }
    }
  }

  /**
   * 清除分析缓存
   */
  clearCache(): void {
    this.analysisCache.clear()
  }

  /**
   * 获取分析历史
   */
  getAnalysisHistory(): BundleAnalysis[] {
    return Array.from(this.analysisCache.values())
  }
}

// 导出单例实例
export const bundleAnalyzer = BundleAnalyzer.getInstance()