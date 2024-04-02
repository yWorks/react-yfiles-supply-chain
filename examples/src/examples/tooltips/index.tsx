import MedievalSupplyChainData from '../../data/medieval-supply-chain.json'
import { RenderSupplyChainTooltip, SupplyChain } from '@yworks/react-yfiles-supply-chain'
import { prepareMedievalSupplyChainData } from '../../data/prepareMedievalSupplyChainData.ts'

const convertedData = prepareMedievalSupplyChainData(MedievalSupplyChainData)

/**
 * An example App showcasing the tooltip functionality of the supply chain component.
 */

export default () => (
  <SupplyChain data={convertedData} renderTooltip={RenderSupplyChainTooltip}></SupplyChain>
)
