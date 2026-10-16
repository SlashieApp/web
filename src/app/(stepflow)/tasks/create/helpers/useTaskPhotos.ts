'use client'

import { useEffect, useRef, useState } from 'react'

import { type TaskPhotoRejection, acceptTaskPhotos } from './taskPhotos'

/**
 * Photos picked for a task (create and edit): the files, a preview URL per
 * file (made once, freed when the photo goes), and what the last pick
 * turned away. `existing` counts photos already on the task.
 */
export function useTaskPhotos(existing = 0) {
  const [files, setFiles] = useState<File[]>([])
  const [rejected, setRejected] = useState<TaskPhotoRejection[]>([])
  const urlsRef = useRef(new Map<File, string>())

  const previews = files.map((file) => {
    let url = urlsRef.current.get(file)
    if (!url) {
      url = URL.createObjectURL(file)
      urlsRef.current.set(file, url)
    }
    return url
  })

  // Free the previews of removed photos, and all of them on unmount.
  useEffect(() => {
    const live = new Set(files)
    for (const [file, url] of urlsRef.current) {
      if (live.has(file)) continue
      URL.revokeObjectURL(url)
      urlsRef.current.delete(file)
    }
  }, [files])
  useEffect(() => {
    const urls = urlsRef.current
    return () => {
      for (const url of urls.values()) URL.revokeObjectURL(url)
      urls.clear()
    }
  }, [])

  const add = (picked: File[]) => {
    const result = acceptTaskPhotos(picked, existing + files.length)
    setRejected(result.rejected)
    if (result.accepted.length > 0) setFiles([...files, ...result.accepted])
  }

  const remove = (index: number) => {
    setRejected([])
    setFiles(files.filter((_, i) => i !== index))
  }

  return { files, previews, rejected, add, remove }
}
