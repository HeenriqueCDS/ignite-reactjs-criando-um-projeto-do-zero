import { GetStaticPaths, GetStaticProps } from 'next';

import format from 'date-fns/format';
import { ptBR } from 'date-fns/locale';


import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';
import Prismic from '@prismicio/client'

import {
  FiCalendar as Calendar,
  FiUser as User,
  FiClock as Clock
} from 'react-icons/fi'
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { RichText } from 'prismic-dom';
import { useRouter } from 'next/router';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {

  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  const amountWords = post.data.content.reduce((acumulador, content) => {
    const words = RichText.asText(content.body).split(' ').length;

    return acumulador + words;
  }, 0);

  const readingTime = Math.ceil(amountWords / 200);

  return (
    <>
      <Header />
      <img src={post.data.banner.url} className={styles.banner}></img>
      <main className={commonStyles.page}>

        <section className={commonStyles.pageContent}>

          <h1 className={styles.postTitle}>{post.data.title}</h1>
          <span className={commonStyles.postInformation}>
            <span><Calendar size={20} />25 mar 2021 {/*{post.first_publication_date} Dribla teste*/}</span>
            <span><User size={20} />{post.data.author}</span>
            <span><Clock size={20} />{readingTime} min</span>
          </span>
          {post.data.content.map((p, index) =>
            {
              
              return (
                <article key={index} className={styles.postArticle}>
                <h3>{p.heading}</h3>
                <p dangerouslySetInnerHTML={{__html: RichText.asHtml(p.body)}} />
                </article>
              )
            }
            )}
          
        </section>
      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 100,
    }
  );

  return {
    paths: posts.results.map(post => ({
      params: { slug: post.uid },
    })),
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params
  const prismic = getPrismicClient();

  const response: Post = await prismic.getByUID('posts', String(slug), {})



  // const estimatedTime = () => {
  //   post.data.content.reduce((accum, current) => {
  //     var totalLetters = accum.body
  //     returnh
  //   })}

  
  const post: Post = {
    first_publication_date: format(
      new Date(response.first_publication_date),
      "dd MMM yyyy",
      {
        locale: ptBR,
      }
    ),
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content
    }
  }

  return {
    props: {
      post,
    },
    revalidate: 60 * 60 * 24, // 24 horas
  }
};
