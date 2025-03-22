import { CustomMDX } from '@/components/mdx/mdx'
import PostDate from '@/components/post-date'
import Image from 'next/image'

export default function PostItem({ ...props }) {
  return (
    <article className="group pt-12 first-of-type:pt-0">
      <div className="md:flex">
        <div className="w-48 shrink-0">
          <time className="bg-linear-to-r mb-3 inline-flex items-center from-purple-500 to-purple-200 bg-clip-text text-sm text-transparent before:h-1.5 before:w-1.5 before:rounded-full before:bg-purple-500 before:ring-4 before:ring-purple-500/30 md:leading-8">
            <span className="ml-[1.625rem] md:ml-5">
              <PostDate dateString={props.metadata.publishedAt} />
            </span>
          </time>
        </div>
        <div className="ml-8 grow border-b pb-12 [border-image:linear-gradient(to_right,--theme(--color-slate-700/.3),--theme(--color-slate-700),--theme(--color-slate-700/.3))1] group-last-of-type:border-none group-last-of-type:pb-0 md:ml-0">
          <header>
            <h2 className="bg-linear-to-r from-slate-200/60 via-slate-200 to-slate-200/60 bg-clip-text pb-6 text-2xl font-bold leading-8 text-transparent">
              {props.metadata.title}
            </h2>
          </header>
          <figure className="bg-linear-to-b mb-8 rounded-3xl from-slate-300/20 to-transparent p-px">
            <Image
              className="w-full rounded-[inherit]"
              src={props.metadata.image}
              width={574}
              height={326}
              alt={props.metadata.title}
            />
          </figure>
          <div className="prose prose-p:leading-relaxed prose-a:text-purple-500 prose-a:no-underline hover:prose-a:underline prose-strong:text-slate-50 prose-strong:font-medium max-w-none text-slate-400">
            <CustomMDX source={props.content} />
          </div>
        </div>
      </div>
    </article>
  )
}
