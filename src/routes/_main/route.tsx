import Navbar from '@/components/navigation/navbar'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_main')({
  component: RouteComponent,
})

const navigationData = [
  {
    title: 'Home',
    href: '#'
  },
  {
    title: 'Products',
    href: '#'
  },
  {
    title: 'About Us',
    href: '#'
  },
  {
    title: 'Contacts',
    href: '#'
  }
]

function RouteComponent() {
  return (
    <>
      <Navbar navigationData={navigationData} />
      <Outlet />
    </>
  )
}
