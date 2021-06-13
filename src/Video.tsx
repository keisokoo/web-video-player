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
    function hashControl() {
      if (window.location.hash) {
      } else {
        props.dropVideo()
      }
    }
    window.addEventListener('hashchange', hashControl, false)
    return () => {
      window.removeEventListener('hashchange', hashControl, false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => {
    if (props.videoItem.index !== undefined) {
      window.location.hash = String(props.videoItem.index)
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
    const nextid = Number(window.location.hash.slice(1)) + 1
    if (nextid < props.list.length) {
      window.location.hash = String(nextid)
    } else {
      if (props.list.length === 1) {
        video_ref.current.pause()
        video_ref.current.currentTime = 0
        video_ref.current.play()
      }
      window.location.hash = '0'
    }
  }
  const [cover, set_cover] = useState(false)
  const toggle_cover = () => {
    set_cover((prev) => !prev)
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
  const [x_ward, set_x_ward] = useState(0)
  const [y_ward, set_y_ward] = useState(0)
  const [z_ward, set_z_ward] = useState(0)
  const [control_bar, set_control_bar] = useState(true)

  const restorePosition = () => {
    set_x_ward(0)
    set_y_ward(0)
    set_z_ward(0)
  }
  const handlePosition = (direction: 'x' | 'y', num: number) => {
    if (direction === 'x') {
      set_x_ward((prev) => prev + num)
    }
    if (direction === 'y') {
      set_y_ward((prev) => prev + num)
    }
  }
  const handleScale = (num: number) => {
    set_z_ward((prev) => prev + num)
  }
  const toggleControlBar = () => {
    set_control_bar((prev) => !prev)
  }
  return (
    <>
      {videoSrc && (
        <div className="video-wrap">
          <div className="video-control">
            <button onClick={toggleControlBar}>토글</button>
            {control_bar && (
              <>
                <div className="left">
                  <button onClick={() => handleScale(1)}>확대</button>
                  <button onClick={() => handleScale(-1)}>축소</button>
                  <button onClick={toggle_cover}>확장</button>
                  <button onClick={toggle_rotate}>회전</button>
                  <button onClick={toggleFullScreen}>전체</button>
                  <button onClick={prev}>이전</button>
                  <button onClick={next}>다음</button>
                </div>
                <div className="middle">
                  <div>
                    <button onClick={() => handlePosition('y', -1)}>
                      위로
                    </button>
                  </div>
                  <div>
                    <button onClick={() => handlePosition('x', -1)}>
                      왼쪽
                    </button>
                    <button onClick={restorePosition}>원복</button>
                    <button onClick={() => handlePosition('x', 1)}>오른</button>
                  </div>
                  <div>
                    <button onClick={() => handlePosition('y', 1)}>아래</button>
                  </div>
                </div>
                <div className="right">
                  <button onClick={props.dropVideo}>닫기</button>
                </div>
              </>
            )}
          </div>
          {/* <div className="video-control ctr-bottom">
            <div className="left"></div>
            <div className="middle"></div>
            <div className="right"></div>
          </div> */}
          <div
            className="video-container"
            style={{
              transform: `translate(${x_ward * 5}%,${y_ward * 5}%) scale(${
                1 + z_ward * 0.2
              })`,
            }}
          >
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
        </div>
      )}
    </>
  )
}
export default VideoComponent
