import Image from "next/image"
import { VscAccount } from "react-icons/vsc"

type ProfileImageProps = {
  src?: string | null
  className?: string
}

export function ProfileImage({ src, className = "" }: ProfileImageProps) {
  return (
    <div className={`relative h-12 w12 overflow-hidden rounded-full ${className}`}>
      {src == null ? (<VscAccount className="h-full w-full" />) : (
        <Image src={src} alt="Profile Image" quality={100} width={40} height={40} />
      )}
    </div>
  )
}