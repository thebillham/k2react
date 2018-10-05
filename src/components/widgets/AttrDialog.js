function AttrDialog(props) {
  <Dialog
  open={this.state.attrDialogOpen}
  onClose={this.handleAttrDialogClose}
  >
    <DialogTitle>Add New Attribute</DialogTitle>
    <DialogContent>
      <DialogContentText></DialogContentText>
      <form>
        <FormGroup>
          <TextField
            id="name"
            label="Name"
            value={this.state.attrObj.name}
            className={classes.dialogField}
            onChange={this.handleAttrObjChange}
          />
          <TextField
            id="date_acquired"
            label="Date Acquired"
            type="date"
            className={classes.dialogField}
            value={this.state.attrObj.date_acquired}
            onChange={this.handleAttrObjChange}
          />
          <TextField
            id="date_expires"
            label="Expiry Date"
            type="date"
            className={classes.dialogField}
            value={this.state.attrObj.date_expires}
            onChange={this.handleAttrObjChange}
          />
          <label>
            <UploadIcon className={classes.accentButton} />
            <input id='attr_upload_file' type='file' className={classes.hidden} onChange={e => {this.onAttrUploadFile(e.currentTarget.files[0])}} />
            <LinearProgress variant="determinate" value={this.state.progress} />
          </label>
        </FormGroup>
      </form>
    </DialogContent>
    <DialogActions>
      <Button onClick={this.handleAttrDialogClose} color="secondary">Cancel</Button>
      <Button onClick={this.handleAttrDialogAdd} color="primary">Add</Button>
    </DialogActions>
</Dialog>
}
