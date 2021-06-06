import React, { useState, useRef } from 'react'
import useFetch from './hooks/useFetch'

const UpdateButton = () => {
  const [, callAxios] = useFetch('')
  const [canUpdate, set_canUpdate] = useState(true)
  const [updateText, set_updateText] = useState('업데이트')

  const interval = useRef<any>()
  const textChanger = useRef<string>()

  const loadingDot = () => {
    if (textChanger.current === '업데이트 중') {
      textChanger.current = '업데이트 중.'
      set_updateText('업데이트 중.')
    } else if (textChanger.current === '업데이트 중.') {
      textChanger.current = '업데이트 중..'
      set_updateText('업데이트 중..')
    } else if (textChanger.current === '업데이트 중..') {
      textChanger.current = '업데이트 중...'
      set_updateText('업데이트 중...')
    } else {
      textChanger.current = '업데이트 중'
      set_updateText('업데이트 중')
    }
  }
  const callUpdate = async () => {
    set_canUpdate(false)
    interval.current = setInterval(loadingDot, 1000)
    const response = await callAxios('/update')
    console.log('response', response)
    clearInterval(interval.current)
    set_updateText('완료')
    setTimeout(() => {
      set_canUpdate(true)
      set_updateText('업데이트')
    }, 1000)
  }
  return (
    <button disabled={!canUpdate} onClick={callUpdate}>
      {updateText}
    </button>
  )
}
export default UpdateButton
