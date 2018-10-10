import { connect } from 'react-redux';

const DocumentModal ({ doc, dispatch }) = (
    <b>Add New Document</b>
        <form>
          <FormGroup>
            <TextField
              id="name"
              label="Name"
              value={doc.name}
              onChange={this.handleAttrObjChange}
            />
            <TextField
              id="date_acquired"
              label="Date Acquired"
              type="date"
              value={this.state.attrObj.date_acquired}
              onChange={this.handleAttrObjChange}
            />
            <TextField
              id="date_expires"
              label="Expiry Date"
              type="date"
              value={this.state.attrObj.date_expires}
              onChange={this.handleAttrObjChange}
            />
            {
              this.state.attrObj.fileUrl &&
              <img src={this.state.attrObj.fileUrl} style={{width: 140, height: 'auto'}} />
            }
            <label>
              <UploadIcon className={classes.accentButton} />
              <input id='attr_upload_file' type='file' className={classes.hidden} onChange={e => {this.onAttrUploadFile(e.currentTarget.files[0])}} />
              <LinearProgress variant="determinate" value={this.state.progress} />
            </label>
          </FormGroup>
        </form>
        <Button onClick={() => dispatch(hideModal())} color="secondary">Cancel</Button>
        {this.props.isUploading ? <Button onClick={this.handleAttrDialogAdd} color="primary" disabled >Submit</Button>
        : <Button onClick={this.handleAttrDialogAdd} color="primary" >Submit</Button>}
      </DialogActions>
  </Dialog>);

  export default connect(mapStateToProps,mapDispatchToProps)(Dialog);
