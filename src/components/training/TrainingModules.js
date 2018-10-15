import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import { Drawer, GridList, GridListTile, Button, Table, TableBody,
  TableCell, TableHead, TableRow, CircularProgress, ExpansionPanel,
  ExpansionPanelDetails, ExpansionPanelSummary, Grid } from '@material-ui/core';

import StaffCard from '../widgets/StaffCard.js';
import { connect } from 'react-redux';
import { auth, database } from '../../config/firebase.js';
import { School, Update, CheckCircle, LooksOne, ExpandMore  } from '@material-ui/icons';

const mapStateToProps = state => {
  return { staff: state.local.staff };
};

class TrainingModules extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      // staffList: [],
      category: 'stack',
      admin: false,
    }
  }

  switch = (category) => {
    this.setState({
      category,
    });
  }

  render() {
    const { category } = this.state;
    return (
        <div style = {{ marginTop: 80 }}>
          <div style={{flexDirection: 'row'}}>
            <Button color="primary" onClick={() => this.switch('stack')}>
              Stack Testing
            </Button>
            <Button color="primary" onClick={() => this.switch('bio')}>
              Biological
            </Button>
            <Button color="primary" onClick={() => this.switch('occ')}>
              Other OCC Health
            </Button>
            <Button color="primary" onClick={() => this.switch('asb')}>
              Asbestos
            </Button>
            <Button color="primary" onClick={() => this.switch('meth')}>
              Methamphetamine
            </Button>
            <Button color="primary" onClick={() => this.switch('other')}>
              Other
            </Button>
            <Button color="primary" onClick={() => this.switch('eq')}>
              Equipment
            </Button>
            <Button color="primary" onClick={() => this.switch('report')}>
              Reporting
            </Button>
          </div>>
          <div>
            <Grid container spacing={16}>
              <Grid item>
                { category === 'stack' &&
                  <div>
                    <b>Trainers: </b> James Piesse
                    <ExpansionPanel>
                      <ExpansionPanelSummary expandIcon={<ExpandMore />}>
                        TFP Stack Testing
                      </ExpansionPanelSummary>
                      <ExpansionPanelDetails>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex,
                        sit amet blandit leo lobortis eget.
                      </ExpansionPanelDetails>
                    </ExpansionPanel>
                    <ExpansionPanel>
                      <ExpansionPanelSummary expandIcon={<ExpandMore />}>
                        PM10 Stack Testing
                      </ExpansionPanelSummary>
                      <ExpansionPanelDetails>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex,
                        sit amet blandit leo lobortis eget.
                      </ExpansionPanelDetails>
                    </ExpansionPanel>
                    <ExpansionPanel>
                      <ExpansionPanelSummary expandIcon={<ExpandMore />}>
                        Condensable Stack Testing
                      </ExpansionPanelSummary>
                      <ExpansionPanelDetails>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex,
                        sit amet blandit leo lobortis eget.
                      </ExpansionPanelDetails>
                    </ExpansionPanel>
                    <ExpansionPanel>
                      <ExpansionPanelSummary expandIcon={<ExpandMore />}>
                        Trace Metals Stack Testing
                      </ExpansionPanelSummary>
                      <ExpansionPanelDetails>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex,
                        sit amet blandit leo lobortis eget.
                      </ExpansionPanelDetails>
                    </ExpansionPanel>
                </div>
                }
                { category === 'bio' &&
                  <div>
                    <b>Trainers: </b> Jess Newcombe, Kelly Hutchinson
                    <ExpansionPanel>
                      <ExpansionPanelSummary expandIcon={<ExpandMore />}>
                        Biological Testing
                      </ExpansionPanelSummary>
                      <ExpansionPanelDetails>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex,
                        sit amet blandit leo lobortis eget.
                      </ExpansionPanelDetails>
                    </ExpansionPanel>
                    <ExpansionPanel>
                      <ExpansionPanelSummary expandIcon={<ExpandMore />}>
                        Bucky Method
                      </ExpansionPanelSummary>
                      <ExpansionPanelDetails>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex,
                        sit amet blandit leo lobortis eget.
                      </ExpansionPanelDetails>
                    </ExpansionPanel>
                    <ExpansionPanel>
                      <ExpansionPanelSummary expandIcon={<ExpandMore />}>
                        QuickTake Method
                      </ExpansionPanelSummary>
                      <ExpansionPanelDetails>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex,
                        sit amet blandit leo lobortis eget.
                      </ExpansionPanelDetails>
                    </ExpansionPanel>
                    <ExpansionPanel>
                      <ExpansionPanelSummary expandIcon={<ExpandMore />}>
                        Surface Sampling Method
                      </ExpansionPanelSummary>
                      <ExpansionPanelDetails>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex,
                        sit amet blandit leo lobortis eget.
                      </ExpansionPanelDetails>
                    </ExpansionPanel>
                  </div>
                }
              </Grid>
              <Grid item>
                <Button color="primary" onClick={() => this.switch('report')}>
                  Reporting
                </Button>
              </Grid>
            </Grid>
          </div>
        </div>
      )
    }
}

export default connect(mapStateToProps)(TrainingModules);
