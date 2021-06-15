import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  MutableRefObject,
} from 'react'
import useFetch from './hooks/useFetch'

import Video from './Video'
import UpdateButton from './UpdateButton'

import { FileProps } from 'custom-types'
import { targetFolderName } from './url'
import shuffle from 'shuffle-array'

interface ListProps {
  initialApiPath: string
}
const limit = 12
const List = (props: ListProps) => {
  const is_mount = useRef(true)
  const more_ref = useRef() as MutableRefObject<HTMLButtonElement>
  const [scrollHeight, set_scrollHeight] = useState(0)
  const [moreStatus, set_moreStatus] = useState(false)
  const [videoInitIndex, setVideoInitIndex] = useState(null as null | number)
  useEffect(() => {
    async function changeHistory(event?: PopStateEvent) {
      if (window?.location?.search && is_mount.current) {
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
  const [page, set_page] = useState(1)
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
    } else if (!backWard || query.includes('search_api')) {
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
      set_fileList(
        fetch.files.sort((a: FileProps, b: FileProps) => b.mtimeMs - a.mtimeMs)
      )
      set_page(1)
      if (fetch.files.length > limit) {
        set_moreStatus(true)
      } else {
        set_moreStatus(false)
      }
    }
    if (fetch?.path) {
      set_path(fetch.path)
    }
  }, [fetch])
  const mixList = (list: any[]) => {
    const test = shuffle([...list])
    set_fileList([...test])
  }
  const dropVideo = () => {
    window.location.hash = ''
    setVideoItem(null)
    setVideoInitIndex(null)
    set_moreStatus(true)
  }
  useEffect(() => {
    function closeVideo(event: any) {
      if (event.key.toLowerCase().includes('esc')) {
        dropVideo()
      }
    }
    if (videoItem) {
      document.body.addEventListener('keyup', closeVideo)
      set_moreStatus(false)
    } else {
      if (scrollHeight) {
        document.documentElement.scrollTop = scrollHeight
      }
    }
    return () => {
      document.body.removeEventListener('keyup', closeVideo)
    }
  }, [videoItem, scrollHeight])
  useEffect(() => {
    const withNext = () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(true)
        }, 500)
      })
    }
    const callback = async function (mutationsList: any, observerState: any) {
      for (const mutation of mutationsList) {
        if (mutation.isIntersecting) {
          observerState.unobserve(mutation.target)
          set_page((prev) => {
            const nextPage = prev + 1
            return nextPage
          })
          await withNext()
          observerState.observe(mutation.target)
        }
      }
    }
    let observer: any
    if (moreStatus) {
      if (more_ref.current) {
        observer = new IntersectionObserver(callback)
        observer.observe(more_ref.current)
      }
    }
    return () => {
      if (observer) {
        observer.disconnect()
      }
    }
  }, [moreStatus])
  const handleVideoItemWithScrollHeight = (item: FileProps, index: number) => {
    const docHeight = document.documentElement.scrollTop
    set_scrollHeight(docHeight)
    setVideoItem({ ...item, index })
  }
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
          <UpdateButton />
          <div>
            <button disabled={query === '/api'} onClick={callInitialList}>
              홈
            </button>
            {query !== '/api' && !query.includes('search_api') && (
              <button onClick={callBackWard}>...{`<상위 폴더>`}</button>
            )}
          </div>
          <section>
            <button onClick={() => setDirListMode((prev) => !prev)}>
              {dirListMode ? '목록 보기' : '아이콘 보기'}
            </button>
            <button
              disabled={fileList.length < 2}
              onClick={() => mixList(fileList)}
            >
              랜덤
            </button>
            <div className="wrap">
              <ul
                id="directories"
                className={`${dirListMode ? 'icon' : 'list'}`}
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
          {fileList.length > 0 && (
            <section>
              <ul id="files" className={`${dirListMode ? 'icon' : 'list'}`}>
                {[...fileList].slice(0, page * limit).map((item, index) => (
                  <li
                    key={item.file_id + item.name}
                    className={`dir-box ${focused === index ? 'focused' : ''}`}
                  >
                    <button
                      onClick={() =>
                        handleVideoItemWithScrollHeight(item, index)
                      }
                      className={`dir-btn`}
                    >
                      {item.name}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {moreStatus && (
            <button
              ref={more_ref}
              disabled={page * limit >= fileList.length}
              onClick={() => set_page((prev) => prev + 1)}
            >
              더보기
            </button>
          )}
        </>
      )}
    </>
  )
}
export default List
