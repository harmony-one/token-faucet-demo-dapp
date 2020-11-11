import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { LinearProgress } from '@material-ui/core';

const styles = props => ({
  colorPrimary: {
    backgroundColor: '#69FABD',
  },
  barColorPrimary: {
    backgroundColor: '#56dea5',
  }
});

class ColoredLoader extends Component {
  render() {
    const { classes } = this.props;
    return (
      <div style={{ position: 'absolute', left: '0px', right: '0px', top: '0px'}}>
        <LinearProgress {...this.props} classes={{colorPrimary: classes.colorPrimary, barColorPrimary: classes.barColorPrimary}} />
      </div>
    )
  }
}

export default withStyles(styles)(ColoredLoader);
