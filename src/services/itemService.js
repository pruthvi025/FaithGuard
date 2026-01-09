// Item Service - Simulates backend storage using localStorage
// In production, this would be API calls to a backend

const STORAGE_KEY = 'faithguard_items'
const MESSAGES_KEY = 'faithguard_messages'

// Generate unique ID
function generateId() {
  return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function generateMessageId() {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Get all items for a temple
export function getItemsForTemple(templeCode) {
  try {
    const items = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    // Filter by temple code and exclude closed items from active feed
    return items.filter(
      (item) => item.templeCode === templeCode && item.status !== 'closed'
    )
  } catch (e) {
    return []
  }
}

// Get all items including closed (for admin/history)
export function getAllItemsForTemple(templeCode) {
  try {
    const items = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return items.filter((item) => item.templeCode === templeCode)
  } catch (e) {
    return []
  }
}

// Get single item by ID
export function getItemById(itemId) {
  try {
    const items = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return items.find((item) => item.id === itemId) || null
  } catch (e) {
    return null
  }
}

// Create new item report
export function createItemReport(itemData, sessionId, templeCode) {
  try {
    const items = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    
    // Check for potential duplicates
    const potentialDuplicates = items.filter(
      (item) =>
        item.templeCode === templeCode &&
        item.status !== 'closed' &&
        (item.title.toLowerCase().includes(itemData.title.toLowerCase()) ||
          itemData.title.toLowerCase().includes(item.title.toLowerCase()))
    )

    const newItem = {
      id: generateId(),
      ...itemData,
      status: 'active',
      templeCode: templeCode,
      reporterSessionId: sessionId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      foundBySessionId: null,
      closedAt: null,
      // Reward fields (optional)
      rewardAmount: itemData.rewardAmount || null,
      rewardGiven: false,
    }

    items.push(newItem)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))

    return {
      item: newItem,
      hasPotentialDuplicates: potentialDuplicates.length > 0,
      duplicates: potentialDuplicates,
    }
  } catch (e) {
    throw new Error('Failed to create item report')
  }
}

// Update item status
export function updateItemStatus(itemId, newStatus, sessionId = null) {
  try {
    const items = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    const itemIndex = items.findIndex((item) => item.id === itemId)

    if (itemIndex === -1) {
      throw new Error('Item not found')
    }

    const item = items[itemIndex]
    const updatedItem = {
      ...item,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    }

    if (newStatus === 'found' && sessionId) {
      updatedItem.foundBySessionId = sessionId
    }

    if (newStatus === 'closed') {
      updatedItem.closedAt = new Date().toISOString()
      // Hide reward after case is closed (for privacy)
      updatedItem.rewardAmount = null
    }

    items[itemIndex] = updatedItem
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))

    return updatedItem
  } catch (e) {
    throw new Error('Failed to update item status')
  }
}

// Update item (for editing description, etc.)
export function updateItem(itemId, updates) {
  try {
    const items = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    const itemIndex = items.findIndex((item) => item.id === itemId)

    if (itemIndex === -1) {
      throw new Error('Item not found')
    }

    const updatedItem = {
      ...items[itemIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    items[itemIndex] = updatedItem
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))

    return updatedItem
  } catch (e) {
    throw new Error('Failed to update item')
  }
}

// Get messages for an item
export function getMessagesForItem(itemId) {
  try {
    const allMessages = JSON.parse(localStorage.getItem(MESSAGES_KEY) || '[]')
    return allMessages.filter((msg) => msg.itemId === itemId)
  } catch (e) {
    return []
  }
}

// Add message to item
export function addMessageToItem(itemId, text, senderSessionId, senderType = 'other') {
  try {
    const allMessages = JSON.parse(localStorage.getItem(MESSAGES_KEY) || '[]')
    
    const newMessage = {
      id: generateMessageId(),
      itemId: itemId,
      text: text.trim(),
      senderSessionId: senderSessionId,
      senderType: senderType, // 'reporter' or 'other'
      createdAt: new Date().toISOString(),
    }

    allMessages.push(newMessage)
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(allMessages))

    return newMessage
  } catch (e) {
    throw new Error('Failed to add message')
  }
}

// Search items
export function searchItems(templeCode, query) {
  const items = getItemsForTemple(templeCode)
  if (!query || query.trim() === '') {
    return items
  }

  const searchTerm = query.toLowerCase().trim()
  return items.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm) ||
      item.description.toLowerCase().includes(searchTerm) ||
      item.location.toLowerCase().includes(searchTerm)
  )
}

// Get items reported by session
export function getItemsByReporter(sessionId, templeCode) {
  try {
    const items = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return items.filter(
      (item) =>
        item.templeCode === templeCode && item.reporterSessionId === sessionId
    )
  } catch (e) {
    return []
  }
}

// Check for duplicate reports
export function checkForDuplicates(title, description, templeCode) {
  try {
    const items = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    const activeItems = items.filter(
      (item) => item.templeCode === templeCode && item.status !== 'closed'
    )

    if (!title || !description) return []

    const titleLower = title.toLowerCase().trim()
    const descLower = description.toLowerCase().trim()

    // Only check if we have meaningful content (at least 3 chars)
    if (titleLower.length < 3 && descLower.length < 3) return []

    return activeItems.filter((item) => {
      const itemTitleLower = item.title.toLowerCase().trim()
      const itemDescLower = item.description.toLowerCase().trim()

      // Check for similar titles (if title is meaningful)
      const titleSimilar =
        titleLower.length >= 3 &&
        itemTitleLower.length >= 3 &&
        (itemTitleLower.includes(titleLower) ||
          titleLower.includes(itemTitleLower))

      // Check for similar descriptions (if description is meaningful)
      const descSimilar =
        descLower.length >= 10 &&
        itemDescLower.length >= 10 &&
        (itemDescLower.includes(descLower) ||
          descLower.includes(itemDescLower))

      // Consider it a duplicate if either title or description is similar
      return titleSimilar || descSimilar
    })
  } catch (e) {
    return []
  }
}
