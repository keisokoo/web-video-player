import { useCallback, useState, useEffect } from 'react'
import axios from 'axios'

const useFetch = (url: string) => {
  const [resp, setResp] = useState(null as any)
  const callAxios = useCallback(async (apiUrl: string) => {
    const response = await axios.get(apiUrl)
    return response.data
  }, [])
  useEffect(() => {
    async function callFetch() {
      setResp(await callAxios(url))
    }
    if (url) {
      callFetch()
    }
  }, [callAxios, url])

  return [resp, callAxios]
}
export default useFetch
