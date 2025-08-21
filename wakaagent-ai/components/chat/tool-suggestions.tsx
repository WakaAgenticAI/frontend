"use client"

import { Button } from "@/components/ui/button"

interface ToolSuggestion {
  id: string
  label: string
  action: string
  icon: any
}

interface ToolSuggestionsProps {
  suggestions: ToolSuggestion[]
  onAction: (action: string) => void
}

export function ToolSuggestions({ suggestions, onAction }: ToolSuggestionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {suggestions.map((suggestion) => {
        const Icon = suggestion.icon
        return (
          <Button
            key={suggestion.id}
            variant="outline"
            size="sm"
            onClick={() => onAction(suggestion.action)}
            className="h-8 text-xs bg-accent/5 border-accent/20 hover:bg-accent/10"
          >
            <Icon className="h-3 w-3 mr-1" />
            {suggestion.label}
          </Button>
        )
      })}
    </div>
  )
}
