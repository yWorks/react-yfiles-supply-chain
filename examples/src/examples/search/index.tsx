import {
  SupplyChain,
  SupplyChainProvider,
  UserSupplyChainConnection,
  UserSupplyChainItem,
  useSupplyChainContext
} from '@yworks/react-yfiles-supply-chain'
import { KeyboardEvent, useState } from 'react'
import { SmallSampleData } from '../../data/small-sample-data.ts'

function SupplyChainComponent() {
  const supplyChainContext = useSupplyChainContext()
  const [searchQuery, setSearchQuery] = useState('')
  const onSearchEnter = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      supplyChainContext.zoomTo(supplyChainContext.getSearchHits())
    }
  }
  return (
    <>
      <SupplyChain
        data={SmallSampleData}
        searchNeedle={searchQuery}
        onSearch={(data: UserSupplyChainItem | UserSupplyChainConnection, searchQuery: string) => {
          return data.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false
        }}
      ></SupplyChain>
      <input
        className="search"
        type={'search'}
        placeholder="Search..."
        style={{
          width: '200px',
          position: 'absolute',
          top: '50px',
          left: 'calc(50% - 100px)'
        }}
        onChange={event => {
          setSearchQuery(event.target.value)
        }}
        onKeyDown={onSearchEnter}
      ></input>
    </>
  )
}

/**
 * An example App showcasing the search functionality of the supply chain component.
 */
export default () => (
  <SupplyChainProvider>
    <SupplyChainComponent></SupplyChainComponent>
  </SupplyChainProvider>
)
