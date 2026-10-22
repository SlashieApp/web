'use client'

import { useEffect, useRef, useState } from 'react'

import type { PhotoTileState } from '@/ui/PhotoTile'
import { isHeicFile, viewablePhoto } from '@/utils/heicPhoto'

import { type TaskPhotoRejection, acceptTaskPhotos } from './taskPhotos'

type PickedPhoto = { id: number; file: File; state: PhotoTileState }

/** A picked photo as its tile shows it. */
export type TaskPhotoTile = {
  key: string
  state: PhotoTileState
  /** Preview URL when `ready`. */
  src: string | null
}

/**
 * Photos picked for a task (create and edit): the files, a tile per photo
 * with a preview URL (made once, freed when the photo goes), and what the
 * last pick turned away. A HEIC this browser can't show is converted to a
 * JPEG here, which replaces it for the preview and the upload; its tile says
 * "Converting photo…" meanwhile, and "Preview not available" if that fails
 * (the original then uploads and the API converts it). `existing` counts
 * photos already on the task.
 */
export function useTaskPhotos(existing = 0) {
  const [photos, setPhotos] = useState<PickedPhoto[]>([])
  const [rejected, setRejected] = useState<TaskPhotoRejection[]>([])
  const nextIdRef = useRef(0)
  const urlsRef = useRef(new Map<File, string>())

  const tiles: TaskPhotoTile[] = photos.map(({ id, file, state }) => {
    let src: string | null = null
    if (state === 'ready') {
      src = urlsRef.current.get(file) ?? URL.createObjectURL(file)
      urlsRef.current.set(file, src)
    }
    return { key: String(id), state, src }
  })

  // Free the previews of removed or converted photos, and all of them on unmount.
  useEffect(() => {
    const live = new Set(photos.map((photo) => photo.file))
    for (const [file, url] of urlsRef.current) {
      if (live.has(file)) continue
      URL.revokeObjectURL(url)
      urlsRef.current.delete(file)
    }
  }, [photos])
  useEffect(() => {
    const urls = urlsRef.current
    return () => {
      for (const url of urls.values()) URL.revokeObjectURL(url)
      urls.clear()
    }
  }, [])

  const update = (id: number, change: Omit<PickedPhoto, 'id'>) =>
    setPhotos((current) =>
      current.map((photo) => (photo.id === id ? { id, ...change } : photo)),
    )

  const convert = async ({ id, file: picked }: PickedPhoto) => {
    const { file, viewable } = await viewablePhoto(picked)
    update(id, { file, state: viewable ? 'ready' : 'unavailable' })
  }

  const add = (picked: File[]) => {
    const result = acceptTaskPhotos(picked, existing + photos.length)
    setRejected(result.rejected)
    const added = result.accepted.map(
      (file): PickedPhoto => ({
        id: nextIdRef.current++,
        file,
        state: isHeicFile(file) ? 'converting' : 'ready',
      }),
    )
    if (added.length === 0) return
    setPhotos((current) => [...current, ...added])
    for (const photo of added) {
      if (photo.state === 'converting') void convert(photo)
    }
  }

  const remove = (index: number) => {
    setRejected([])
    setPhotos((current) => current.filter((_, i) => i !== index))
  }

  return {
    files: photos.map((photo) => photo.file),
    tiles,
    /** A HEIC is still being converted: Continue, Post and Save wait for it. */
    converting: photos.some((photo) => photo.state === 'converting'),
    rejected,
    add,
    remove,
  }
}
