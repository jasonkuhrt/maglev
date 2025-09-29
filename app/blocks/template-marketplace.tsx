'use client'

import { TemplateCard } from '#blocks/template-card'
import { useLocalStorageSet } from '#hooks/use-local-storage'
import { Grid, styled } from '#styled-system/jsx'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'

interface Props {
  templates: Array<{
    id: string
    code: string
    name: string
    description: string | null
    services: Array<{ name: string }>
    githubRepos: string[]
  }>
}

export const TemplateMarketplace = ({ templates }: Props) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [favorites, setFavorites] = useLocalStorageSet<string>('template-favorites')

  const filter = searchParams.get('filter') || 'all'

  const toggleFavorite = (templateId: string) => {
    setFavorites(prev => {
      const next = new Set(prev)
      if (next.has(templateId)) {
        next.delete(templateId)
      } else {
        next.add(templateId)
      }
      return next
    })
  }

  // Filter templates based on search and favorites
  const filteredTemplates = useMemo(() => {
    let result = templates

    // Filter by favorites
    if (filter === 'starred') {
      result = result.filter(t => favorites.has(t.id))
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(t =>
        t.name.toLowerCase().includes(query)
        || t.description?.toLowerCase().includes(query)
        || t.services.some(s => s.name.toLowerCase().includes(query))
      )
    }

    return result
  }, [templates, searchQuery, filter, favorites])

  return (
    <>
      {/* Controls */}
      <styled.div
        display='flex'
        gap='16px'
        mb='32px'
        flexWrap='wrap'
        alignItems='center'
      >
        {/* Search Input */}
        <styled.input
          type='text'
          placeholder='Search templates...'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          flex='1'
          minWidth='200px'
          p='8px 12px'
          border='1px solid black'
          fontSize='sm'
          bg='white'
          _focus={{ outline: 'none', borderWidth: '2px' }}
        />

        {/* Filter Toggle */}
        <styled.div display='flex' gap='0'>
          <styled.button
            type='button'
            onClick={() => {
              setSearchParams({ filter: 'all' })
            }}
            p='8px 16px'
            border='1px solid black'
            borderRight={filter === 'all' ? '1px solid black' : 'none'}
            bg={filter === 'all' ? 'black' : 'white'}
            color={filter === 'all' ? 'white' : 'black'}
            fontSize='xs'
            fontWeight='700'
            letterSpacing='0.05em'
            textTransform='uppercase'
            cursor='pointer'
            transition='all 0.15s'
          >
            All ({templates.length})
          </styled.button>
          <styled.button
            type='button'
            onClick={() => {
              setSearchParams({ filter: 'starred' })
            }}
            p='8px 16px'
            border='1px solid black'
            bg={filter === 'starred' ? 'black' : 'white'}
            color={filter === 'starred' ? 'white' : 'black'}
            fontSize='xs'
            fontWeight='700'
            letterSpacing='0.05em'
            textTransform='uppercase'
            cursor='pointer'
            transition='all 0.15s'
            display='flex'
            alignItems='center'
            gap='6px'
          >
            <styled.span fontSize='sm'>★</styled.span>
            Starred ({favorites.size})
          </styled.button>
        </styled.div>
      </styled.div>

      {/* Results */}
      {filteredTemplates.length === 0
        ? (
          <styled.div
            p='40px'
            border='1px solid black'
            bg='white'
            textAlign='center'
          >
            <styled.p fontSize='lg' fontWeight='600' mb='8px'>
              No templates found
            </styled.p>
            <styled.p fontSize='sm' color='gray.600'>
              {filter === 'starred'
                ? 'Star some templates to see them here'
                : 'Try adjusting your search query'}
            </styled.p>
          </styled.div>
        )
        : (
          <Grid
            gridTemplateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}
            gap='0'
            gridAutoRows='1fr'
          >
            {filteredTemplates.map((template) => (
              <styled.div key={template.id} position='relative' height='100%'>
                <TemplateCard
                  template={template}
                  services={template.services}
                  githubRepos={template.githubRepos}
                />
                {/* Favorite Star */}
                <styled.button
                  type='button'
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleFavorite(template.id)
                  }}
                  position='absolute'
                  top='12px'
                  right='12px'
                  w='32px'
                  h='32px'
                  display='flex'
                  alignItems='center'
                  justifyContent='center'
                  bg='white'
                  border='1px solid black'
                  cursor='pointer'
                  fontSize='lg'
                  transition='all 0.15s'
                  _hover={{ bg: 'black', color: 'white' }}
                  title={favorites.has(template.id) ? 'Remove from favorites' : 'Add to favorites'}
                >
                  {favorites.has(template.id) ? '★' : '☆'}
                </styled.button>
              </styled.div>
            ))}
          </Grid>
        )}
    </>
  )
}
