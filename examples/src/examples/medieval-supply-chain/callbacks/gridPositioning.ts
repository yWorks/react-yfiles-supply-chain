import { GridPositioningFunction, SupplyChainItem } from '@yworks/react-yfiles-supply-chain'

/**
 * Provides a grid position for supply chain items, used in the layout.
 */
export const gridPositioning: GridPositioningFunction = (
  item: SupplyChainItem
): { row: number; column: number } => {
  let gridDefiningProp = ''

  if ('subgroup' in item) {
    gridDefiningProp = 'subgroup'
  } else if ('name' in item) {
    gridDefiningProp = 'name'
  }

  if (gridDefiningProp === '') {
    // put all "unknown" items into the last column
    return { row: 0, column: 4 }
  }

  switch (item[gridDefiningProp]) {
    case 'raw-resource':
      return { row: 0, column: 0 }
    case 'raw-material':
      return { row: 0, column: 1 }
    case 'storage':
      return { row: 0, column: 2 }
    case 'energy-pipe-distribution':
      return { row: 0, column: 2 }
    case 'intermediate-product':
      return { row: 0, column: 3 }
    default:
      return { row: 0, column: 4 }
  }
}
