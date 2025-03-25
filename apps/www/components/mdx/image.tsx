import Image, { StaticImageData } from 'next/image'

interface PostImageProps {
  alt: string
  caption?: string
  size?: string
  src: StaticImageData
}

export default function PostImage({
  alt,
  caption,
  size,
  ...props
}: PostImageProps) {
  const classes = size === 'lg' ? 'lg:-ml-32 lg:-mr-32' : ''

  return (
    <figure className={classes}>
      <Image className="w-full" {...props} alt={alt} />
      {caption && (
        <figcaption className="mt-3 text-center text-sm text-gray-500">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
