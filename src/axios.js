import axios from 'axios'

// 접속 URL에 따라 백엔드 API 주소 자동 설정
const getBaseURL = () => {
  const hostname = window.location.hostname
  const port = 3210

  // 로컬 개발
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `http://localhost:${port}`
  }

  // NAS IP로 접속
  if (hostname === '125.141.20.218') {
    return `http://125.141.20.218:${port}`
  }

  // 도메인(synology.me 등)
  if (hostname.includes('synology.me')) {
    return `http://${hostname}:${port}`
  }

  return `http://125.141.20.218:${port}`
}

const api = axios.create({
  baseURL: getBaseURL()
})

export default api
