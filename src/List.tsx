import React, { useState, useEffect, useCallback } from 'react'
import useFetch from './hooks/useFetch'

import Video from './Video'
import UpdateButton from './UpdateButton'

import { FileProps } from 'custom-types'
import { targetFolderName } from './url'

interface ListProps {
  initialApiPath: string
}
const List = (props: ListProps) => {
  const [videoInitIndex, setVideoInitIndex] = useState(null as null | number)
  useEffect(() => {
    function changeHistory(event?: PopStateEvent) {
      if (window?.location?.search) {
        const params = new URLSearchParams(window.location.search)
        const qString = params.get('q')
        const dString = params.get('d')
        if (qString) {
          setQuery('/search_api/' + qString)
        }
        if (dString) {
          setQuery('/api' + dString)
        }
      } else {
        setQuery('/api')
      }
      if (window?.location?.hash) {
        setVideoInitIndex(Number(window.location.hash.slice(1)))
      }
    }
    console.log(window?.location?.hash)
    changeHistory()
    window.addEventListener('popstate', changeHistory)
    return () => {
      window.removeEventListener('popstate', changeHistory)
    }
  }, [])
  const [query, setQuery] = useState(props.initialApiPath)
  const [fetch] = useFetch(query)
  const [path, set_path] = useState('')
  const [dirList, set_dirList] = useState<Array<string>>([''])
  const [dirListMode, setDirListMode] = useState(false)
  const [fileList, set_fileList] = useState<Array<FileProps>>([])
  const [term, setTerm] = useState('')
  const [focused, setFocused] = useState(-1)
  const [hoveredItem, setHoveredItem] = useState({
    targetIndex: -1,
    x: 0,
    y: 0,
    text: '',
  })
  const [videoItem, setVideoItem] = useState<FileProps | null>()
  useEffect(() => {
    if (
      videoInitIndex !== undefined &&
      videoInitIndex !== null &&
      fileList?.length > 0
    ) {
      const cloned = Object.assign({}, fileList[videoInitIndex])
      setVideoItem({
        ...cloned,
        index: videoInitIndex,
      })
    }
  }, [videoInitIndex, fileList])
  const searchWithTerm = useCallback((event) => {
    if (event.key.toLowerCase().includes('enter')) {
      if (event?.target.value) {
        const typedQuery = encodeURIComponent(event?.target.value)
        window.history.pushState(null, typedQuery, '?q=' + typedQuery)
        setQuery('/search_api/' + typedQuery)
      } else {
        callInitialList()
      }
    }
  }, [])
  const callBackWard = () => {
    const backWard = path
      .split('/')
      .filter((i) => i)
      .slice(0, -1)
      .join('/')
    if (backWard === targetFolderName) {
      callInitialList()
    } else {
      const typedQuery = encodeURIComponent(`/${backWard}/`)
      window.history.pushState(null, typedQuery, '?d=' + typedQuery)
      setQuery(`/api/${backWard}/`)
    }
  }
  const callInitialList = () => {
    window.history.pushState(null, '/api', '/')
    setQuery('/api')
  }
  const finderDir = (item: string) => {
    const typedQuery = encodeURIComponent(item)
    window.history.pushState(null, typedQuery, '?d=' + typedQuery)
    setQuery('/api' + item)
  }
  useEffect(() => {
    if (fetch?.dirs) {
      set_dirList(fetch.dirs)
    }
    if (fetch?.files) {
      set_fileList(fetch.files)
    }
    if (fetch?.path) {
      set_path(fetch.path)
    }
  }, [fetch])
  const dropVideo = () => {
    setVideoItem(null)
  }
  useEffect(() => {
    function closeVideo(event: any) {
      if (event.key.toLowerCase().includes('esc')) {
        window.location.hash = ''
        setVideoItem(null)
        setVideoInitIndex(null)
      }
    }
    if (videoItem) {
      document.body.addEventListener('keyup', closeVideo)
    }
    return () => {
      document.body.removeEventListener('keyup', closeVideo)
    }
  }, [videoItem])
  return (
    <>
      {videoItem ? (
        <Video dropVideo={dropVideo} list={fileList} videoItem={videoItem} />
      ) : (
        <>
          {!dirListMode &&
            hoveredItem.text.length > 5 &&
            hoveredItem.targetIndex > -1 && (
              <div
                className="title-tooltip"
                style={{ top: hoveredItem.y, left: hoveredItem.x }}
              >
                {hoveredItem.text}
              </div>
            )}
          <div>{path.replace('/' + targetFolderName, '')}</div>
          <UpdateButton />
          <input
            type="text"
            value={query}
            readOnly={true}
            onChange={(e) => setQuery(e.target.value)}
          />
          <input
            type="text"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            onKeyPress={searchWithTerm}
          />
          <span>폴더: {dirList?.length}, </span>
          <span>파일: {fileList?.length}</span>
          <div>
            <button disabled={query === '/api'} onClick={callInitialList}>
              홈
            </button>
            {query !== '/api' && (
              <button onClick={callBackWard}>...{`<상위 폴더>`}</button>
            )}
          </div>
          <section>
            <button onClick={() => setDirListMode((prev) => !prev)}>
              {dirListMode ? '아이콘 보기' : '목록 보기'}
            </button>
            <div className="wrap">
              <ul
                id="directories"
                className={`${dirListMode ? 'list' : 'icon'}`}
              >
                {dirList.length > 0 &&
                  dirList.map((item, index) => (
                    <li
                      key={'dir' + item + index}
                      className={`dir-box ${
                        focused === index ? 'focused' : ''
                      }`}
                    >
                      <button
                        onDoubleClick={() => finderDir(item)}
                        onKeyPress={(e) => {
                          if (e.key.toLocaleLowerCase().includes('enter')) {
                            finderDir(item)
                          }
                        }}
                        onFocus={() => setFocused(index)}
                        className={`dir-btn`}
                      >
                        <div className="thumbnail-box folder-icon"></div>
                        <div
                          {...(focused === index && {
                            onMouseEnter: () => {
                              setHoveredItem((prev) => ({
                                ...prev,
                                targetIndex: index,
                              }))
                            },
                            onMouseMove: (e) => {
                              setHoveredItem((prev) => ({
                                ...prev,
                                x: e.pageX,
                                y: e.pageY,
                                text: item.replace(path, ''),
                              }))
                            },
                            onMouseLeave: () => {
                              setHoveredItem({
                                targetIndex: -1,
                                x: 0,
                                y: 0,
                                text: '',
                              })
                            },
                          })}
                          className="folder-title"
                        >
                          {item.replace(path, '')}
                        </div>
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
          </section>
          <section>
            <ul id="files">
              {fileList.length > 0 &&
                fileList.map((item, index) => (
                  <li key={item.file_id + item.name}>
                    <button onClick={() => setVideoItem({ ...item, index })}>
                      {item.name}
                    </button>
                  </li>
                ))}
            </ul>
          </section>
        </>
      )}
    </>
  )
}
export default List
