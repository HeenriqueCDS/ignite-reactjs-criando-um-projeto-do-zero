import Link from 'next/link'
import { useRouter } from 'next/router'
import styles from './header.module.scss'

export default function Header() {

  const router = useRouter()

  return(
    <header onClick={() => router.push('/')}  className={styles.header}>
      <Link href='/'>
      <a>
      <img src="/logo.svg" alt="logo" />
      </a>
      </Link>
    </header>
  )
}
