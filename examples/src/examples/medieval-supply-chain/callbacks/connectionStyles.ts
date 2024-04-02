import {
  ConnectionStyleProvider,
  ConnectionStyle,
  SupplyChainItem,
  SupplyChainConnection
} from '@yworks/react-yfiles-supply-chain'

const highAmountConnectionStyle: ConnectionStyle = {
  className: 'high-amount-edge',
  thickness: 6,
  smoothingLength: 10,
  targetArrow: {
    type: 'triangle',
    color: 'red'
  }
}

const mediumAmountConnectionStyle: ConnectionStyle = {
  className: 'medium-amount-edge',
  thickness: 4,
  smoothingLength: 10,
  targetArrow: {
    type: 'triangle',
    color: '#242424'
  }
}

/**
 * Provides styles for the supply chain and folding connections
 * based on the "amount" property on the connections.
 */
export const connectionStyles: ConnectionStyleProvider = (
  data: { source: SupplyChainItem; target: SupplyChainItem; connection: SupplyChainConnection }[]
): ConnectionStyle | undefined => {
  // The maximum "amount" in an edge is used to determine its style.
  let maxAmount = 0

  // If more than one object is passed in the data parameter,
  // this function is being asked by the StylingFoldingEdgeConverter
  // for the style of the folding connection.
  if (data.length > 1) {
    // We look for the highest "amount" in any of the folded connections.
    maxAmount = data.reduce((accumulator, currentValue) => {
      if (
        'amount' in currentValue.connection &&
        typeof currentValue.connection.amount === 'number'
      ) {
        return accumulator + currentValue.connection.amount
      }
      return accumulator
    }, 0)
  }
  // Get the maximum amount for a single connection.
  else if (data.length === 1) {
    const connection = data[0].connection
    if ('amount' in connection && typeof connection.amount === 'number') {
      maxAmount = connection.amount
    }
  }

  if (maxAmount > 999) {
    return highAmountConnectionStyle
  } else if (maxAmount > 499) {
    return mediumAmountConnectionStyle
  }

  return
}
