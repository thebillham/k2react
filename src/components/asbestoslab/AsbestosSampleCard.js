import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import Grid from '@material-ui/core/Grid';
import CardContent from "@material-ui/core/CardContent";
import CardActions from "@material-ui/core/CardActions";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import { SAMPLE } from "../../constants/modal-types";


const styles = {
  card: {
    minWidth: 500,
    minHeight: 50
  },
  bullet: {
    display: "inline-block",
    margin: "0 2px",
    transform: "scale(0.8)"
  },
  name: {
    marginBottom: 4,
    fontSize: 16,
    fontWeight: "bold"
  },
  details: {
    fontSize: 14
  }
};

function AsbestosSampleCard(props) {
  const { classes, sample } = props;

  return (
    <Grid container key={sample.uid}>
      <Grid item xs={1}>
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end', marginTop: 16, marginRight: 10}}>
        {sample.samplenumber}
      </div>
      </Grid>
      <Grid item xs={11}>
        <Card className={classes.card} style={{ height: 18 }}>
          <CardContent>
            <Grid container>
              <Grid item xs={7}>{sample.description}</Grid>
              <Grid item xs={4}>{sample.material}</Grid>
              <Grid item xs={1}>
                <Button
                  size="small"
                  onClick={() => {
                    this.props.showModal({
                      modalType: SAMPLE,
                      modalProps: {
                        doc: sample
                      }
                    });
                  }}>
                  Edit
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

AsbestosSampleCard.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(AsbestosSampleCard);
