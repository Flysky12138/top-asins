// 获取页面 AISN
export const getPageAsins = async (url: string, page: number): Promise<string[]> => {
  try {
    const data = await fetch(`${url}?pg=${page}`).then(res => res.text())
    const dataClientRecsList = Array.from(data.match(/data-client-recs-list="(.+?)"/))[1].replaceAll('&quot;', '"')
    return JSON.parse(dataClientRecsList).map(item => item.id)
  } catch (error) {
    console.error('%s #%d', url, page)
    return Promise.reject([])
  }
}

// 获取对应 ASIN 的父 ASIN
export const getParentAsin = async (asin: string) => {
  try {
    const res = await fetch(`https://www.amazon.com/dp/${asin}`)
    if (res.status == 404) return ''
    const data = await res.text()
    return data.match(/"parentAsin":\s*"(\w+)"/)[1]
  } catch (error) {
    console.error('asin:', asin)
    return Promise.reject('')
  }
}

// 上传
export const uploadAsins = async (category: string, parentAsins: string[]) => {
  try {
    await fetch('https://api.xuanmiao.tech/amazon/google_sheet/upload_new_release_asins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category,
        asins: parentAsins
      })
    })
  } catch (error) {
    console.error(category, error)
  }
}
