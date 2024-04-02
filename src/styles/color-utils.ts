import { SupplyChainItem, SupplyChainItemId } from '../SupplyChain.tsx'

const materialColors400 = [
  'background1',
  'background2',
  'background3',
  'background4',
  'background5',
  'background6',
  'background7',
  'background8',
  'background9',
  'background10',
  'background11',
  'background12',
  'background13',
  'background14',
  'background15',
  'background16'
]
const colorMap = new Map<SupplyChainItemId, string>()

export function colorMapping(dataItem: SupplyChainItem): string | null {
  const parentId = dataItem.parentId
  if (typeof parentId !== 'undefined') {
    let color = colorMap.get(parentId)
    if (!color) {
      color = materialColors400[colorMap.size % materialColors400.length]
      colorMap.set(parentId, color)
    }
    return color
  }
  return null
}
