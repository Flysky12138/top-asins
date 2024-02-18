import { clsx } from 'clsx'
import React from 'react'
import { useAsync } from 'react-use'
import { useImmer } from 'use-immer'
import '~globals.css'
import { getPageAsins, getParentAsin, uploadAsins } from '~lib/fetch'
import { retry } from '~lib/retry'
import { sleep } from '~lib/sleep'
import { LIST } from '~lib/static'

type CategoryType = {
  name: (typeof LIST)[number]['category']
  asins: Array<{
    value: string
    parent: string
  }>
}

export default function App() {
  const [categories, setCategories] = useImmer<CategoryType[]>([])

  // 获取父 asin
  const getParentAsins = React.useCallback(async (categories: CategoryType[]) => {
    for (let i = 0; i < categories.length; i++) {
      const cache: string[] = []
      const { asins, name: category } = categories[i]
      for (let j = 0; j < asins.length; j++) {
        const parentAsin = await retry(() => getParentAsin(asins[j].value), 10 * 1000)
        cache.push(parentAsin)
        setCategories(state => {
          state[i].asins[j].parent = parentAsin
        })
        await sleep(Math.max(5, Math.random() * 10) * 1000)
      }
      await uploadAsins(category, cache)
    }
  }, [])

  useAsync(async () => {
    const cache: CategoryType[] = []
    for (const { url, category } of LIST) {
      const asins = [await retry(() => getPageAsins(url, 1), 10 * 1000), await retry(() => getPageAsins(url, 2), 10 * 1000)].flat()
      cache.push({ name: category, asins: asins.map(asin => ({ value: asin, parent: '' })) })
    }
    setCategories(cache)
    await getParentAsins(cache)
    window.close()
  })

  return (
    <section className="mx-auto my-10 max-w-screen-md">
      <h2 className="mb-8 text-center text-xl font-bold">用于获取新品榜 Asins，获取完成会自动关闭该页面</h2>
      {categories.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-2 gap-y-4">
          {categories.map(category => (
            <table key={category.name} className="mt-3 border-collapse text-sm">
              <caption className="pb-2 text-sm">{category.name}</caption>
              <thead>
                <tr className="bg-slate-300">
                  <th className="border">#</th>
                  <th className="w-40 border">asin</th>
                  <th className="w-40 border">parent asin</th>
                </tr>
              </thead>
              <tbody>
                {category.asins.map(({ value, parent }, index) => (
                  <tr
                    key={value + index}
                    className={clsx({
                      'bg-green-200': parent
                    })}
                  >
                    <td className="border text-center">{index + 1}</td>
                    <td className="border px-4">{value}</td>
                    <td className="border px-4">{parent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ))}
        </div>
      ) : (
        <p className="text-center text-lg italic">Loading...</p>
      )}
    </section>
  )
}
