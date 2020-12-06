import React, { useState, useEffect } from "react"
import {
  Typography,
  Button
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import { colors } from "../../theme";

import {
  GET_BALANCES_PERPETUAL_RETURNED
} from '../../constants'

import Store from "../../stores";
const store = Store.store
const emitter = Store.emitter

const useStyles = makeStyles(theme => ({
  gradient: {
    backgroundColor: colors.white,
    '&:hover': {
      backgroundColor: '#00AEE9',
      '& .title': {
        color: `${colors.white} !important`
      },
      '& .icon': {
        color: `${colors.white} !important`
      }
    },
    '& .title': {
      color: '#00AEE9',
    },
    '& .icon': {
      color: '#00AEE9'
    },
  }
}));

export default function Balances() {
  const classes = useStyles();
  const [tokenBalance, setTokenBalance] = useState(0)

  useEffect(() => {
    const getBalancesReturned = () => {
      const tokens = store.getStore('tokens')
      setTokenBalance((tokens && tokens.length >= 1) ? tokens[0].balance : 0)
    }

    emitter.on(GET_BALANCES_PERPETUAL_RETURNED, getBalancesReturned);

    return () => {
      emitter.removeListener(GET_BALANCES_PERPETUAL_RETURNED, getBalancesReturned);
    }
  }, [])

  return (
    <Button
    className={ classes.gradient }
    variant="outlined"
    color="primary"
    disabled={ true }
    >
      <Typography>{ tokenBalance } TST</Typography>
    </Button>
  )
}
