import {
  ConnectionLabelProvider,
  FoldingConnection,
  SimpleConnectionLabel,
  SupplyChainConnection,
  SupplyChainModel
} from '@yworks/react-yfiles-supply-chain'

/**
 * Provides connection label descriptions (@link SimpleConnectionLabel} for
 * supply chain and folding connections.
 */
export const connectionLabels: ConnectionLabelProvider<SupplyChainConnection> = (
  item: SupplyChainConnection | FoldingConnection,
  ctx: SupplyChainModel
) => {
  if (ctx.isFoldingConnection(item)) {
    const connections = item.connections as SupplyChainConnection[]
    const amountSum = connections.reduce((accumulator, currentConnection) => {
      if ('amount' in currentConnection && typeof currentConnection.amount === 'number') {
        return accumulator + currentConnection.amount
      }
      return accumulator
    }, 0)

    return {
      text: `connections: ${connections.length}\namount: ${amountSum}`,
      labelShape: 'round-rectangle'
    } satisfies SimpleConnectionLabel
  }

  if ('amount' in item && typeof item.amount === 'number') {
    return {
      text: `amount: ${item.amount}`,
      labelShape: 'round-rectangle'
    } satisfies SimpleConnectionLabel
  }
}
