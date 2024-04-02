import {
  SupplyChainData,
  UserSupplyChainItem,
  UserSupplyChainConnection
} from '@yworks/react-yfiles-supply-chain'

export function prepareMedievalSupplyChainData(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
): SupplyChainData<UserSupplyChainItem, UserSupplyChainConnection> {
  const nodesData: UserSupplyChainItem[] = []
  const groupsData: UserSupplyChainItem[] = []
  const connectionsData: UserSupplyChainConnection[] = []

  const itemData = data['item'] as Record<string, unknown>
  Object.entries(itemData).forEach(([key, value]) => {
    const data = value as Record<string, unknown>
    const item: UserSupplyChainItem = {
      id: key,
      name: (data.name as string) || key
    }

    if (typeof data['subgroup'] !== 'undefined') {
      const subgroup = data['subgroup'] as string

      const groupName = subgroup
      const groupId = `${subgroup}:group`

      item.parentId = groupId

      if (groupsData.findIndex(group => group.id === groupId) === -1) {
        const group: UserSupplyChainItem = {
          id: groupId,
          name: groupName
        }
        groupsData.push(group)
      }
    }

    // just copy the remaining data
    Object.assign(item, data)

    nodesData.push(item)
  })

  Object.entries(data['recipe']).forEach(([, value]) => {
    const data = value as Record<string, unknown>

    const result = data['result'] as string

    if (!itemData[result]) {
      return
    }

    const ingredients = data['ingredients'] as (
      | [string, number]
      | { amount: number; name: string; type: string }
    )[]
    if (!ingredients) {
      return
    }

    ingredients.forEach(ingredient => {
      let srcIngredient = ''
      let amount: number | undefined
      if (Array.isArray(ingredient)) {
        srcIngredient = ingredient[0]
        amount = ingredient[1]
      } else {
        srcIngredient = ingredient.name
        amount = ingredient.amount
      }

      if (itemData[srcIngredient]) {
        const connection: UserSupplyChainConnection = {
          sourceId: srcIngredient,
          targetId: result,
          amount
        }
        connectionsData.push(connection)
      }
    })
  })

  return { items: [...nodesData, ...groupsData], connections: connectionsData }
}
