import { LinearProgress } from '@material-ui/core'

export default function Loader() {
  return (
    <div style={{ position: 'absolute', left: '0px', right: '0px', top: '0px'}}>
      <LinearProgress />
    </div>
  )
}
