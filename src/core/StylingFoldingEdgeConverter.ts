import {
  FoldingEdgeState,
  FreeEdgeLabelModel,
  IEdge,
  IFoldingView,
  IList,
  MergingFoldingEdgeConverter,
  SimpleLabel
} from 'yfiles'
import {
  ConnectionStyleProvider,
  FoldingConnection,
  SupplyChainBaseItem,
  SupplyChainConnection,
  SimpleConnectionLabel
} from '../SupplyChain.tsx'
import { convertToPolylineEdgeStyle } from '@yworks/react-yfiles-core'
import { convertToDefaultLabelStyle } from './data-loading.ts'
import { defaultEdgeStyle } from './defaults.ts'

type LabelProvider<TSupplyChainConnection extends SupplyChainConnection> = (
  item: TSupplyChainConnection | FoldingConnection<TSupplyChainConnection>
) => SimpleConnectionLabel | undefined

/**
 * A merging folding edge converter which uses a {@link ConnectionStyleProvider}
 * for the styling of the folding edge.
 */
export default class StylingFoldingEdgeConverter<
  TSupplyChainItem extends SupplyChainBaseItem,
  TSupplyChainConnection extends SupplyChainConnection
> extends MergingFoldingEdgeConverter {
  private _connectionStyleProvider:
    | ConnectionStyleProvider<TSupplyChainItem, TSupplyChainConnection>
    | undefined = undefined
  set connectionStyleProvider(
    value: ConnectionStyleProvider<TSupplyChainItem, TSupplyChainConnection> | undefined
  ) {
    this._connectionStyleProvider = value
  }

  private _connectionLabelProvider: LabelProvider<TSupplyChainConnection> | undefined = undefined
  set connectionLabelProvider(value: LabelProvider<TSupplyChainConnection> | undefined) {
    this._connectionLabelProvider = value
  }

  initializeFoldingEdgeState(
    state: FoldingEdgeState,
    foldingView: IFoldingView,
    foldingEdge: IEdge,
    masterEdges: IList<IEdge>
  ) {
    super.initializeFoldingEdgeState(state, foldingView, foldingEdge, masterEdges)
    this.updateFoldingEdgeState(state, foldingView, foldingEdge, masterEdges)
  }

  updateFoldingEdgeState(
    state: FoldingEdgeState,
    foldingView: IFoldingView,
    foldingEdge: IEdge,
    masterEdges: IList<IEdge>
  ) {
    state.clearLabels()

    if (this._connectionStyleProvider) {
      const data: {
        source: TSupplyChainItem
        target: TSupplyChainItem
        connection: TSupplyChainConnection
      }[] = []
      masterEdges.forEach(masterEdge => {
        const source = masterEdge.sourceNode!.tag as TSupplyChainItem
        const target = masterEdge.targetNode!.tag as TSupplyChainItem
        const connection = masterEdge.tag as TSupplyChainConnection
        data.push({ connection, source, target })
      })

      const foldingEdgeStyle = this._connectionStyleProvider(data)
      if (foldingEdgeStyle) {
        state.style = convertToPolylineEdgeStyle(foldingEdgeStyle)
      } else {
        state.style = defaultEdgeStyle.clone()
      }
    }

    const foldingLinkData: FoldingConnection<TSupplyChainConnection> = {
      connections: masterEdges.map(masterEdge => masterEdge.tag).toArray()
    }

    if (this._connectionLabelProvider) {
      const connectionLabel = this._connectionLabelProvider(foldingLinkData)
      if (connectionLabel) {
        const labelStyle = convertToDefaultLabelStyle(connectionLabel)
        const simpleLabel = new SimpleLabel(null, connectionLabel.text)
        simpleLabel.style = labelStyle
        const preferredSize = labelStyle.renderer.getPreferredSize(simpleLabel, labelStyle)

        state.addLabel(
          connectionLabel.text,
          FreeEdgeLabelModel.INSTANCE.createDefaultParameter(),
          labelStyle,
          preferredSize,
          null
        )
      }
    }

    state.tag = foldingLinkData
  }
}
