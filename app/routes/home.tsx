import { redirect } from 'react-router'

export const loader = () => {
  return redirect('/market')
}

export default function Home() {
  return null
}