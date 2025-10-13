"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Globe, Check } from "lucide-react"
import { getSupportedLanguages, LanguagesResponse } from "@/lib/api"

interface LanguageSelectorProps {
  selectedLanguage: string
  onLanguageChange: (language: string) => void
  className?: string
}

export function LanguageSelector({ selectedLanguage, onLanguageChange, className }: LanguageSelectorProps) {
  const [languages, setLanguages] = useState<LanguagesResponse['supported_languages']>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadLanguages() {
      try {
        const response = await getSupportedLanguages()
        setLanguages(response.supported_languages)
      } catch (error) {
        console.error('Failed to load languages:', error)
        // Fallback to default languages
        setLanguages([
          { code: 'en', name: 'ENGLISH', display_name: 'English' },
          { code: 'pcm', name: 'PIDGIN', display_name: 'Nigerian Pidgin' },
          { code: 'ha', name: 'HAUSA', display_name: 'Hausa' },
          { code: 'yo', name: 'YORUBA', display_name: 'Yoruba' },
          { code: 'ig', name: 'IGBO', display_name: 'Igbo' }
        ])
      } finally {
        setIsLoading(false)
      }
    }

    loadLanguages()
  }, [])

  const getLanguageFlag = (code: string) => {
    const flags: Record<string, string> = {
      'en': '🇺🇸',
      'pcm': '🇳🇬',
      'ha': '🇳🇬',
      'yo': '🇳🇬',
      'ig': '🇳🇬'
    }
    return flags[code] || '🌐'
  }

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Globe className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Loading languages...</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Globe className="h-4 w-4 text-muted-foreground" />
      <Select value={selectedLanguage} onValueChange={onLanguageChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select language">
            <div className="flex items-center space-x-2">
              <span>{getLanguageFlag(selectedLanguage)}</span>
              <span>{languages.find(l => l.code === selectedLanguage)?.display_name || 'English'}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {languages.map((language) => (
            <SelectItem key={language.code} value={language.code}>
              <div className="flex items-center space-x-2">
                <span>{getLanguageFlag(language.code)}</span>
                <span>{language.display_name}</span>
                {selectedLanguage === language.code && (
                  <Check className="h-3 w-3 text-primary ml-auto" />
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedLanguage !== 'en' && (
        <Badge variant="outline" className="text-xs">
          Multilingual
        </Badge>
      )}
    </div>
  )
}
