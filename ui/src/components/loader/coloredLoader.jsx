import React from "react"
import { makeStyles } from '@material-ui/core/styles'
import { LinearProgress } from '@material-ui/core'

const useStyles = makeStyles(theme => ({
  colorPrimary: {
    backgroundColor: '#69FABD',
  },
  barColorPrimary: {
    backgroundColor: '#56dea5',
  }
}));

export default function ColoredLoader(props) {
  const classes = useStyles();
  return (
    <div style={{ position: 'absolute', left: '0px', right: '0px', top: '0px'}}>
      <LinearProgress {...props} classes={{colorPrimary: classes.colorPrimary, barColorPrimary: classes.barColorPrimary}} />
    </div>
  )
}
