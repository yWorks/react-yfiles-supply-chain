import { UserSupplyChainItem, RenderItemProps } from '@yworks/react-yfiles-supply-chain'

export function LittleAlchemyNode(props: RenderItemProps<UserSupplyChainItem>) {
  const dataItem = props.dataItem

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        minWidth: '64px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyItems: 'center',
        alignItems: 'center'
      }}
    >
      <div
        style={{
          flex: '0 0 64px',
          padding: '5px',
          backgroundColor: '#F5F5F5',
          borderRadius: '100%',
          boxSizing: 'border-box'
        }}
      >
        <img
          height="100%"
          src={`https://littlealchemy2.com/static/icons/${parseInt(dataItem.id as string)}.svg`}
        />
      </div>
      <div
        style={{
          backgroundColor: '#F5F5F5',
          borderRadius: '4px',
          padding: '5px',
          fontFamily: 'sans-serif',
          textTransform: 'capitalize'
        }}
      >
        {dataItem.name}
      </div>
    </div>
  )
}
