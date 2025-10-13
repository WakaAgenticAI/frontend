"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  Brain, 
  Mic, 
  Globe, 
  Zap, 
  Shield, 
  BarChart3, 
  Users, 
  Package,
  ShoppingCart,
  RefreshCw
} from "lucide-react"
import { getAICapabilities, CapabilitiesResponse } from "@/lib/api"

interface AICapabilitiesProps {
  className?: string
}

export function AICapabilities({ className }: AICapabilitiesProps) {
  const [capabilities, setCapabilities] = useState<CapabilitiesResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadCapabilities = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await getAICapabilities()
      setCapabilities(response)
    } catch (err) {
      setError('Failed to load AI capabilities')
      console.error('Error loading capabilities:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCapabilities()
  }, [])

  const getAgentIcon = (agentName: string) => {
    const icons: Record<string, any> = {
      'orders': ShoppingCart,
      'inventory': Package,
      'crm': Users,
      'forecast': BarChart3,
      'fraud': Shield
    }
    
    for (const [key, icon] of Object.entries(icons)) {
      if (agentName.toLowerCase().includes(key)) {
        return icon
      }
    }
    return Brain
  }

  const getFeatureIcon = (feature: string) => {
    if (feature.toLowerCase().includes('voice') || feature.toLowerCase().includes('audio')) {
      return Mic
    }
    if (feature.toLowerCase().includes('multilingual') || feature.toLowerCase().includes('language')) {
      return Globe
    }
    if (feature.toLowerCase().includes('streaming') || feature.toLowerCase().includes('real-time')) {
      return Zap
    }
    return Brain
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-primary" />
            <span>AI Capabilities</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading capabilities...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !capabilities) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-primary" />
            <span>AI Capabilities</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">{error || 'Failed to load capabilities'}</p>
            <Button onClick={loadCapabilities} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-primary" />
          <span>AI Capabilities</span>
          <Badge variant="outline" className="ml-auto">
            {capabilities.llm_models.length} Models
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* LLM Models */}
        <div>
          <h4 className="font-medium mb-3 flex items-center space-x-2">
            <Zap className="h-4 w-4 text-primary" />
            <span>Language Models</span>
          </h4>
          <div className="flex flex-wrap gap-2">
            {capabilities.llm_models.map((model) => (
              <Badge key={model} variant="secondary" className="text-xs">
                {model}
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        {/* Supported Languages */}
        <div>
          <h4 className="font-medium mb-3 flex items-center space-x-2">
            <Globe className="h-4 w-4 text-primary" />
            <span>Supported Languages</span>
            {capabilities.multilingual_support && (
              <Badge variant="outline" className="text-xs">
                Multilingual
              </Badge>
            )}
          </h4>
          <div className="flex flex-wrap gap-2">
            {capabilities.supported_languages.map((lang) => (
              <Badge key={lang.code} variant="outline" className="text-xs">
                {lang.display_name}
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        {/* Audio Formats */}
        <div>
          <h4 className="font-medium mb-3 flex items-center space-x-2">
            <Mic className="h-4 w-4 text-primary" />
            <span>Audio Formats</span>
          </h4>
          <div className="flex flex-wrap gap-2">
            {capabilities.audio_formats.map((format) => (
              <Badge key={format} variant="outline" className="text-xs">
                {format}
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        {/* AI Agents */}
        <div>
          <h4 className="font-medium mb-3 flex items-center space-x-2">
            <Users className="h-4 w-4 text-primary" />
            <span>AI Agents</span>
            <Badge variant="outline" className="text-xs">
              {Object.keys(capabilities.agents).length} Agents
            </Badge>
          </h4>
          <ScrollArea className="h-32">
            <div className="space-y-3">
              {Object.entries(capabilities.agents).map(([name, agent]) => {
                const Icon = getAgentIcon(name)
                return (
                  <div key={name} className="flex items-start space-x-3 p-2 rounded-lg bg-muted/50">
                    <Icon className="h-4 w-4 mt-0.5 text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium capitalize">
                        {name.replace(/[._]/g, ' ')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {agent.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {agent.tools.slice(0, 3).map((tool) => (
                          <Badge key={tool} variant="outline" className="text-xs">
                            {tool}
                          </Badge>
                        ))}
                        {agent.tools.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{agent.tools.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </div>

        <Separator />

        {/* Features */}
        <div>
          <h4 className="font-medium mb-3 flex items-center space-x-2">
            <Brain className="h-4 w-4 text-primary" />
            <span>Features</span>
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {capabilities.features.map((feature) => {
              const Icon = getFeatureIcon(feature)
              return (
                <div key={feature} className="flex items-center space-x-2 p-2 rounded-lg bg-muted/30">
                  <Icon className="h-3 w-3 text-primary" />
                  <span className="text-xs">{feature}</span>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
