import React, { useEffect, useRef, useState } from 'react'
import { FileProps } from 'custom-types'
import { url, targetFolderName } from './url'

interface VideoProps {
  videoItem: FileProps
  dropVideo: () => void
  list: Array<FileProps>
}
const VideoComponent = (props: VideoProps) => {
  const [videoSrc, setVideoSrc] = useState('')
  const video_ref = useRef() as React.MutableRefObject<HTMLVideoElement>
  useEffect(() => {
    if (props.videoItem.index) {
      window.location.hash = props.videoItem.index + ''
    }
    setVideoSrc(
      `${url}/${targetFolderName}/${encodeURIComponent(
        props.videoItem.path.replace(`/${targetFolderName}/`, '')
      )}`
    )
  }, [props.videoItem])
  const prev = () => {
    const prev = Number(window.location.hash.slice(1)) - 1
    if (prev > -1) {
      window.location.hash = String(prev)
    } else {
      window.location.hash = String(props.list.length - 1)
    }
  }
  const next = () => {
    console.log(props.list.length)
    const nextid = Number(window.location.hash.slice(1)) + 1
    if (nextid < props.list.length) {
      window.location.hash = String(nextid)
    } else {
      window.location.hash = '0'
    }
  }
  const [cover, set_cover] = useState(false)
  const toggle_cover = () => {
    set_cover((prev) => !prev)

    if (video_ref.current) {
      console.log('video_ref', video_ref.current)
    }
  }
  const [rotate, set_rotate] = useState(0 as 0 | 90 | 180 | 270)
  const toggle_rotate = () =>
    set_rotate((prev) =>
      prev === 0 ? 90 : prev === 90 ? 180 : prev === 180 ? 270 : 0
    )
  function toggleFullScreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }
  return (
    <>
      {videoSrc && (
        <div className="video-wrap">
          <div className="video-control">
            <div className="left">
              <button onClick={props.dropVideo}>닫기</button>
            </div>
            <div className="middle">
              <button onClick={toggle_cover}>확장</button>
              <button onClick={toggle_rotate}>회전</button>
              <button onClick={toggleFullScreen}>전체</button>
            </div>
            <div className="right">
              <button onClick={prev}>이전</button>
              <button onClick={next}>다음</button>
            </div>
          </div>
          <video
            ref={video_ref}
            style={{
              objectFit: cover ? 'cover' : 'contain',
              transform: `rotate(${rotate}deg)`,
            }}
            onEnded={next}
            src={videoSrc}
            autoPlay
            controls
          ></video>
        </div>
      )}
    </>
  )
}
export default VideoComponent
