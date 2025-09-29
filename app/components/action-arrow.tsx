import { styled } from '#styled-system/jsx'

interface Props {
  text: string
}

export const ActionArrow: React.FC<Props> = ({ text }) => {
  return (
    <styled.div
      display='flex'
      alignItems='center'
      fontSize='sm'
      fontWeight='700'
      letterSpacing='0.05em'
      textTransform='uppercase'
    >
      {text}
      <styled.span
        data-arrow
        ml='8px'
        display='inline-block'
        transition='transform 0.15s'
      >
        →
      </styled.span>
    </styled.div>
  )
}
