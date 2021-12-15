import { GetStaticProps } from 'next';
import Link from 'next/link'

import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client'

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { FiCalendar as Calendar, FiUser as User } from 'react-icons/fi'

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

import Header from '../components/Header';
import { useState } from 'react';


interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {

  const [page, setPage] = useState(postsPagination.next_page)
  const [results, setResults] = useState(postsPagination.results)

 const handleLoadmore = async () => {
  const newPagination = await (await fetch(page)).json() as PostPagination

  let newResults = [...results]
  

  newResults = [...newResults, ...newPagination.results.map(post => {
    post
    post.first_publication_date = format(
      new Date(post.first_publication_date),
      "dd MMM yyyy",
      {
        locale: ptBR,
      }
    )
    return post;
  }
    )]

  setResults(newResults)
  setPage(newPagination.next_page)
  
 }


  return (
    <><Header />
    <main className={commonStyles.page}>
      
      <section className={commonStyles.pageContent}>
        <div className={styles.content}>

          {results.map(post => {
            return (
              <Link href={`post/${post.uid}`}>
              <a className={styles.post} key={post.uid}>

                <h1>{post.data.title}</h1>
                <h2>{post.data.subtitle}</h2>
                <span className={commonStyles.postInformation}>
                  <span><Calendar size={20} />{post.first_publication_date}</span>
                  <span><User size={20} />{post.data.author}</span>
                </span>
              </a>
              </Link>
            )
          })}
          {page? <button onClick={handleLoadmore}>Carregar mais posts</button> : ''}
        </div>
      </section>
    </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([Prismic.Predicates.at('document.type', 'posts')], {
    pageSize: 1,
  });
  const posts = postsResponse.results as Post[]

  posts.map(post => {
    post
    post.first_publication_date = format(
      new Date(post.first_publication_date),
      "dd MMM yyyy",
      {
        locale: ptBR,
      }
    )
  })

  return {
    props: {
      postsPagination: {
        results: posts,
        next_page: postsResponse.next_page,
      }
    }
  }

};
