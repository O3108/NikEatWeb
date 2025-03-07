import {headers} from "next/headers";

export const getUrl = async () => {
  const headersList = await headers()
  const host = headersList.get('host')
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'

  return `${protocol}://${host}/`
}
