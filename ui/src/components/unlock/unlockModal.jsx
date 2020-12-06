import React from "react";
import {
  DialogContent,
  Dialog,
  Slide
} from '@material-ui/core';

import Unlock from './index.jsx';

export default function UnlockModal(props) {
  const { closeModal, modalOpen } = props
  const fullScreen = window.innerWidth < 450
  const Transition = React.forwardRef((props, ref) => <Slide direction="up" {...props} ref={ref} />)

  return (
    <Dialog open={ modalOpen } onClose={ closeModal } fullWidth={ true } maxWidth={ 'sm' } TransitionComponent={ Transition } fullScreen={ fullScreen }>
      <DialogContent>
        <Unlock closeModal={ closeModal } />
      </DialogContent>
    </Dialog>
  )
}
