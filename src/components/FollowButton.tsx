import { useSession } from "next-auth/react"
import { Button } from "./Button"

type FollowButtonProps = {
  userId: string
  isFollowing: boolean
  isLoading: boolean
  onClick: () => void
}

export function FollowButton({ userId, isFollowing, isLoading, onClick }: FollowButtonProps) {
  const session = useSession()

  if (session.status !== 'authenticated' || session.data.user.id === userId) {
    return null;
  }

  return <Button
    onClick={onClick}
    small
    gray={isFollowing}
    disabled={isLoading}
  >
    {isFollowing ? "Unfollow" : "Follow"}
  </Button>
}