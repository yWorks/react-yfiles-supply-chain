import MedievalSupplyChain from '../examples/medieval-supply-chain'
import CustomFolderStyle from '../examples/custom-folder-style'
import CustomItemStyle from '../examples/custom-item-style'
import Tooltips from '../examples/tooltips'
import LittleAlchemy from '../examples/little-alchemy'
import SimpleData from '../examples/simple-example'
import ConnectionStyling from '../examples/connection-styling'
import GraphSearch from '../examples/search'
import SupplyChainProvider from '../examples/supply-chain-provider'
import Export from '../examples/export'
import SwitchData from '../examples/switch-data'

export interface IRoute {
  title: string
  description: string
  path: string
  component: React.ComponentType
}

const routes: IRoute[] = [
  {
    title: 'Medieval Supply Chain',
    description: 'A fictional, medieval supply chain',
    path: 'medieval-supply-chain',
    component: MedievalSupplyChain
  },
  {
    title: 'Custom Item Styling',
    description: 'Demonstrates custom styling for supply chain items.',
    path: 'item-styling',
    component: CustomItemStyle
  },
  {
    title: 'Custom Folder Styling',
    description: 'Demonstrates custom styling for grouping and folding items.',
    path: 'folder-styling',
    component: CustomFolderStyle
  },
  {
    title: 'Tooltips',
    description: 'Demonstrates the tooltip popup',
    path: 'tooltips',
    component: Tooltips
  },
  {
    title: 'Little Alchemy 2',
    description: 'Explore recipes of Little Alchemy 2',
    path: 'little-alchemy',
    component: LittleAlchemy
  },
  {
    title: 'Simple Example',
    description: 'Simple data example',
    path: 'simple',
    component: SimpleData
  },
  {
    title: 'Connection Styling',
    description: 'Simple data with styled connections',
    path: 'connection-styling',
    component: ConnectionStyling
  },
  {
    title: 'Search',
    description: 'Simple example to demonstrate the search component',
    path: 'graph-search',
    component: GraphSearch
  },
  {
    title: 'SupplyChainProvider',
    description: 'Demonstrates the usage of the SupplyChainProvider',
    path: 'supply-chain-provider',
    component: SupplyChainProvider
  },
  {
    title: 'Export',
    description: 'An example demonstrating the export to an image and printing.',
    path: 'graph-export',
    component: Export
  },
  {
    title: 'Switch Data',
    description: 'Switching to different input data with partially shared ids',
    path: 'switch-data',
    component: SwitchData
  }
]

export default routes
