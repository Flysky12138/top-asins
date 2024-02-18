import { sleep } from './sleep'

export const retry = async <T extends () => any>(promise: T, delay = 3000): Promise<ReturnType<T>> => {
  let ans = null
  for (let i = 0; i < 3; i++) {
    try {
      return await promise()
    } catch (error) {
      ans = error
      await sleep(delay)
    }
  }
  return ans
}
