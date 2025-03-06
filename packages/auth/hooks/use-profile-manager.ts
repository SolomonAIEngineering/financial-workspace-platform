/**
 * @fileoverview Hook for managing user profile data and updates.
 */

import { useCallback, useState } from 'react'

import { useUser } from '@clerk/nextjs'

export interface ProfileUpdateData {
  firstName?: string
  lastName?: string
  username?: string
  imageUrl?: string
}

export interface UseProfileManagerReturn {
  user: ReturnType<typeof useUser>['user']
  isLoaded: boolean
  updateProfile: (data: ProfileUpdateData) => Promise<void>
  updateImage: (file: File) => Promise<void>
  deleteImage: () => Promise<void>
  isPending: boolean
}

/**
 * Hook for managing user profile data including updates and image management.
 *
 * @returns {UseProfileManagerReturn} Profile management functions and state
 *
 * @example
 * // Basic profile update
 * function ProfileEditor() {
 *   const { user, updateProfile, isLoaded } = useProfileManager();
 *
 *   const onSubmit = (data) => {
 *     await updateProfile({
 *       firstName: data.firstName,
 *       lastName: data.lastName
 *     });
 *   };
 *
 *   if (!isLoaded) return 'Loading...';
 *
 *   return (
 *     <form onSubmit={handleSubmit(onSubmit)}>
 *       <input defaultValue={user?.firstName} />
 *       <input defaultValue={user?.lastName} />
 *       <button type="submit">Update</button>
 *     </form>
 *   );
 * }
 *
 * @example
 * // Profile image management
 * function ImageUploader() {
 *   const { updateImage, deleteImage } = useProfileManager();
 *
 *   return (
 *     <div>
 *       <input
 *         type="file"
 *         onChange={(e) => updateImage(e.target.files[0])}
 *       />
 *       <button onClick={deleteImage}>Remove Image</button>
 *     </div>
 *   );
 * }
 */
export function useProfileManager(): UseProfileManagerReturn {
  const { user, isLoaded, isSignedIn } = useUser()
  const [isPending, setIsPending] = useState(false)

  const updateProfile = useCallback(
    async (data: ProfileUpdateData) => {
      if (!user) return
      setIsPending(true)
      try {
        await user.update(data)
      } finally {
        setIsPending(false)
      }
    },
    [user],
  )

  const updateImage = useCallback(
    async (file: File) => {
      if (!user) return
      setIsPending(true)
      try {
        await user.setProfileImage({ file })
      } finally {
        setIsPending(false)
      }
    },
    [user],
  )

  const deleteImage = useCallback(async () => {
    if (!user) return
    setIsPending(true)
    try {
      await user.setProfileImage({ file: null })
    } finally {
      setIsPending(false)
    }
  }, [user])

  return {
    user,
    isLoaded,
    updateProfile,
    updateImage,
    deleteImage,
    isPending,
  }
}
