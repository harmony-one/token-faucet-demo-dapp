import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles'
import {
  Typography,
  Button,
} from '@material-ui/core';

import { transparentize } from 'polished'

import { colors } from '../../theme'

import harmonyLogo from '../../assets/harmony.png';

import UnlockModal from '../unlock/unlockModal.jsx'

const useStyles = makeStyles(theme => ({
  root: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    //background: colors.compoundGreen,
    minWidth: '100vw',
    padding: '36px 24px',
    backgroundPosition: '0 -10vh',
    backgroundImage: `radial-gradient(50% 50% at 50% 50%, ${transparentize(0.9, '#00AEE9')} 0%, ${transparentize(1, '#FFFFFF')} 100%)`,
    //backgroundImage: `linear-gradient(${transparentize(0.9, '#00AEE9')}, ${transparentize(1, '#FFFFFF')})`
  },
  connectHeading: {
    maxWidth: '400px',
    textAlign: 'center',
    color: '#00AEE9'
  },
  actionButton: {
    background: '#bcecfd',
    color: '#00AEE9',
    borderColor: '#00AEE9'
  },
  notConnectedRoot: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectedRoot: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    width: '100%'
  },
  address: {
    color: colors.white,
    width: '100%',
    paddingBottom: '24px',
    display: 'flex',
    justifyContent: 'space-between'
  },
  balances: {
    color: colors.white,
    width: '100%',
    padding: '12px'
  },
  balanceContainer: {
    display: 'flex',
    width: '100%',
    justifyContent: 'space-between'
  },
  accountHeading: {
    paddingBottom: '6px'
  },
  icon: {
    cursor: 'pointer'
  },
  disclaimer: {
    padding: '12px',
    border: '1px solid '+colors.white,
    borderRadius: '0.75rem',
    marginBottom: '24px',
    fontWeight: 1,
    color: colors.white,
    background: colors.red
  }
}))

export default function Account() {
  const classes = useStyles()
  const [modalOpen, setModalOpen] = useState(false)

  const renderNotConnected = () => {
    return (
      <div className={ classes.notConnectedRoot }>
        <div className={ classes.connectHeading }>
          <Typography variant='h2'>Token faucet demo dApp on Harmony</Typography>
          <img alt='Harmony logo' src={harmonyLogo} />
        </div>
        <Button
          className={ classes.actionButton }
          color="primary"
          onClick={connectClicked}
          >
          <Typography>Connect your wallet</Typography>
        </Button>
        { modalOpen && renderModal() }
      </div>
    )
  }

  const connectClicked = () => {
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
  }

  const renderModal = () => {
    return (
      <UnlockModal closeModal={ closeModal } modalOpen={ modalOpen } />
    )
  }

  return (
    <div className={ classes.root }>
      { renderNotConnected() }
    </div>
  )
}
