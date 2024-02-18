const openTab = () => chrome.tabs.create({ url: './tabs/index.html', active: true })

// 添加工具栏右键菜单
chrome.runtime.onInstalled.addListener(async () => {
  chrome.contextMenus.create({
    id: 'top-asins',
    title: '手动执行',
    contexts: ['action']
  })
})
chrome.contextMenus.onClicked.addListener(({ menuItemId }) => {
  if (menuItemId != 'top-asins') return
  openTab()
})

// 每天早7运行
const tomorrowAt7AM = () => {
  const now = new Date()
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 7, 0, 0, 0)
  return tomorrow.getTime()
}
chrome.alarms.create('daily', { when: tomorrowAt7AM(), periodInMinutes: 24 * 60 })
chrome.alarms.onAlarm.addListener(({ name }) => {
  if (name != 'daily') return
  openTab()
})

// 30秒闹钟
chrome.alarms.create({ periodInMinutes: 0.5 })
