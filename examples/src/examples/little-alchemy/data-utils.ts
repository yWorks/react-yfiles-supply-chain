import {
  UserSupplyChainItem,
  UserSupplyChainConnection,
  SupplyChainData
} from '@yworks/react-yfiles-supply-chain'

type LittleAlchemyItem = { n: string; p: [string, string][]; c: string[]; prime: boolean }
type LittleAlchemyData = Record<string, LittleAlchemyItem>
const littleAlchemyRequest = await fetch(
  'https://unpkg.com/little-alchemy-2@0.0.1/dist/alchemy.json'
)
const littleAlchemyData = (await littleAlchemyRequest.json()) as LittleAlchemyData

export function getLittleAlchemyElementFromName(
  name: string
): [string, LittleAlchemyItem] | undefined {
  return Object.entries(littleAlchemyData).find(([, item]) => item.n === name)
}

function getLittleAlchemyElement(id: string): LittleAlchemyItem | null {
  return littleAlchemyData[id] ?? null
}

function getSupplyChainItem(id: string, alchemyItem: LittleAlchemyItem): UserSupplyChainItem {
  const item = { id, name: alchemyItem.n } as UserSupplyChainItem
  if (alchemyItem.prime) {
    item.prime = true
  }
  return item
}

function getEdgeId(sourceId: string, targetId: string): string {
  return `${sourceId}->${targetId}`
}

function populateSources(
  id: string,
  nodes: Map<string, UserSupplyChainItem>,
  edges: Map<string, UserSupplyChainConnection>
): void {
  const item = getLittleAlchemyElement(id)
  if (!item) {
    return
  }

  const sources = item.p
  if (sources) {
    sources.forEach(([source1, source2]) => {
      if (source1 === source2) {
        edges.set(getEdgeId(source1, id), {
          sourceId: source1,
          targetId: id,
          name: `+ ${littleAlchemyData[source2].n}`
        })
        nodes.set(source1, getSupplyChainItem(source1, getLittleAlchemyElement(source1)!))
      } else {
        edges.set(getEdgeId(source1, id), {
          sourceId: source1,
          targetId: id,
          name: `+ ${littleAlchemyData[source2].n}`
        })
        edges.set(getEdgeId(source2, id), {
          sourceId: source2,
          targetId: id,
          name: `+ ${littleAlchemyData[source1].n}`
        })
        nodes.set(source1, getSupplyChainItem(source1, getLittleAlchemyElement(source1)!))
        nodes.set(source2, getSupplyChainItem(source2, getLittleAlchemyElement(source2)!))
      }
    })
  }
}

function populateTargets(
  id: string,
  nodes: Map<string, UserSupplyChainItem>,
  edges: Map<string, UserSupplyChainConnection>
): void {
  const item = getLittleAlchemyElement(id)
  if (!item) {
    return
  }

  const targets = item.c
  if (targets) {
    targets.forEach(targetId => {
      // find other ingredient
      const targetItem = getLittleAlchemyElement(targetId)!
      let otherIncredientId: string = ''
      targetItem.p.forEach(sourcePair => {
        const isParentPair = sourcePair[0] === id || sourcePair[1] === id
        if (isParentPair) {
          otherIncredientId = sourcePair[0] === id ? sourcePair[1] : sourcePair[0]
        }
      })

      const otherIngredient = getLittleAlchemyElement(otherIncredientId)!
      edges.set(getEdgeId(id, targetId), {
        sourceId: id,
        targetId: targetId,
        name: `+ ${otherIngredient.n}`
      })
      nodes.set(targetId, getSupplyChainItem(targetId, targetItem))
    })
  }
}

export function getNeighbors(
  id: string
): SupplyChainData<UserSupplyChainItem, UserSupplyChainConnection> {
  let connectionsData: UserSupplyChainConnection[] = []
  let itemsData: UserSupplyChainItem[] = []
  const item = littleAlchemyData[id]
  if (item) {
    const nodes: Map<string, UserSupplyChainItem> = new Map<string, UserSupplyChainItem>()
    const edges: Map<string, UserSupplyChainConnection> = new Map<
      string,
      UserSupplyChainConnection
    >()
    nodes.set(id, getSupplyChainItem(id, item)!)
    populateSources(id, nodes, edges)
    populateTargets(id, nodes, edges)
    itemsData = [...nodes.values()]
    connectionsData = [...edges.values()]
  }

  return { items: itemsData, connections: connectionsData }
}
