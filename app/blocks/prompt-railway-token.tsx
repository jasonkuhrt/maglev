import { LinkButton } from '#components/button'
import { Prompt } from '#components/prompt'
import { AlertTriangle } from 'lucide-react'

export const RailwayTokenPrompt = () => {
  return (
    <Prompt
      variant='warning'
      icon={AlertTriangle}
      title='Railway API Token Required'
      message='You need to configure your Railway API token to access templates and manage deployments.'
      action={
        <LinkButton
          to='/settings'
          variant='solid'
          size='sm'
          style={{
            backgroundColor: 'black',
            color: 'white',
          }}
        >
          Configure API Token in Settings →
        </LinkButton>
      }
    />
  )
}
