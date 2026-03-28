import axios from 'axios'
import i18n from './i18n'

export function fetchCourses() {
  const lang = i18n.language || 'en'
  return axios.get(`/api/courses?language=${lang}`)
}
