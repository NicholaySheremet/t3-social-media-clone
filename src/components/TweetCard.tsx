import Link from "next/link"
import { ProfileImage } from "./ProfileImage"
import { useSession } from "next-auth/react"
import { VscHeart, VscHeartFilled } from "react-icons/vsc";
import { IconHoverEffect } from "./IconHoverEffect";
import { api } from "~/utils/api";

type Tweet = {
  id: string
  content: string
  createdAt: Date
  likeCount: number
  likedByMe: boolean
  user: {
    id: string
    image: string | null
    name: string | null
  }
}

type HeartButtonProps = {
  onClick: () => void
  isLoading: boolean
  likedByMe: boolean
  likeCount: number
}

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "short"
})

function HeartButton({ likedByMe, likeCount, onClick, isLoading }: HeartButtonProps) {
  const session = useSession();

  const HeartIcon = likedByMe ? VscHeartFilled : VscHeart;

  if (session.status !== "authenticated") {
    return (
      <div className="mb-1 mt-1 flex items-center gap-3 self-start text-gray-500">
        <HeartIcon />
        <span>{likeCount}</span>
      </div>
    )
  }
  return (
    <button
      disabled={isLoading}
      onClick={onClick}
      className={`group flex -ml-2 items-center gap-1 self-start transition-colors duration-200 ${likedByMe
        ? 'text-red-500'
        : 'text-gray-500 hover:text-red-500 focus-visible:text-red-500'
        }`}
    >
      <IconHoverEffect red>
        <HeartIcon className={`transition-colors duration-200 ${likedByMe
          ? 'fill-red-500'
          : 'fill-gray-500 group-hover:fill-red-500 group-focus-visible:fill-red-500'
          }`}
        />
      </IconHoverEffect>
      <span>{likeCount}</span>
    </button>
  )
}

export function TweetCard({
  id,
  user,
  content,
  createdAt,
  likeCount,
  likedByMe
}: Tweet) {
  const trpcUtils = api.useContext();
  const toogleLike = api.tweet.toggleLike.useMutation({
    onSuccess: ({ addedLike }) => {
      const updateData: Parameters<
        typeof trpcUtils
        .tweet
        .infiniteFeed
        .setInfiniteData
      >[1] = (oldData) => {
        if (oldData == null) return;
        const countModifier = addedLike ? 1 : -1;
        return {
          ...oldData,
          pages: oldData.pages.map(page => {
            return {
              ...page,
              data: page.data.map(tweet => {
                if (tweet.id === id) {
                  return {
                    ...tweet,
                    likeCount: tweet.likeCount + countModifier,
                    likedByMe: addedLike
                  }
                }
                return tweet
              })
            }
          })
        }
      }

      trpcUtils
        .tweet
        .infiniteFeed
        .setInfiniteData({}, updateData)

      trpcUtils
        .tweet
        .infiniteFeed
        .setInfiniteData({ onlyFollowing: true }, updateData)

      trpcUtils
        .tweet
        .infiniteProfileFeed
        .setInfiniteData({ userId: user.id }, updateData)
    }
  })

  function handleToggleLike() {
    toogleLike.mutate({ id })
  }

  return <li className="flex gap-4 border-b px-4 py-4">
    <Link href={`profiles/${user.id}`}><ProfileImage src={user.image} /></Link>
    <div className="flex flex-grow flex-col">
      <div className="flex gap-1">
        <Link
          href={`profiles/${user.id}`}
          className="font-bold hover:underline focus-visible:underline"
        >
          {user.name}
        </Link>
        <span className="text-gray-500">-</span>
        <span className="text-gray-500">{dateTimeFormatter.format(createdAt)}</span>
      </div>
      <p className="whitespace-pre-wrap">{content}</p>
      <HeartButton
        onClick={handleToggleLike}
        isLoading={toogleLike.isLoading}
        likeCount={likeCount}
        likedByMe={likedByMe}
      />
    </div>
  </li>
}