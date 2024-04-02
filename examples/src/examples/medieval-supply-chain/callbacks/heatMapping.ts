import {
  FoldingConnection,
  HeatFunction,
  SupplyChainConnection,
  SupplyChainItem,
  SupplyChainModel
} from '@yworks/react-yfiles-supply-chain'

/**
 * Provides a "heat" value for supply chain items as well as folding connections.
 */
export const heatMapping: HeatFunction = (
  item: SupplyChainItem | SupplyChainConnection | FoldingConnection,
  { isFoldingConnection }: SupplyChainModel
): number => {
  // For a folding connection, we add all amount values of all contained connections.
  if (isFoldingConnection(item)) {
    const connections = item.connections as SupplyChainConnection[]
    const amountSum = connections.reduce((accumulator, currentConnection) => {
      if (hasAmount(currentConnection)) {
        return accumulator + currentConnection.amount
      }
      return accumulator
    }, 0)
    return amountSum / 100
  }

  if (hasAmount(item)) {
    return item.amount / 50
  }

  if (hasStackSize(item)) {
    return item.stack_size / 100
  }

  return 0
}

function hasAmount(
  item: SupplyChainItem | SupplyChainConnection
): item is (SupplyChainItem | SupplyChainConnection) & { amount: number } {
  return 'amount' in item && typeof item.amount === 'number'
}

function hasStackSize(
  item: SupplyChainItem | SupplyChainConnection
): item is (SupplyChainItem | SupplyChainConnection) & { stack_size: number } {
  return 'stack_size' in item && typeof item.stack_size === 'number'
}
