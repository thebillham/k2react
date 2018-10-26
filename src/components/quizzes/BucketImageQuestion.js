import React from 'react';
import ReactDOM from 'react-dom';
import { FormControl, FormLabel, Grid } from '@material-ui/core';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const move = (source, destination, droppableSource, droppableDestination) => {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(droppableSource.index, 1);

  destClone.splice(droppableDestination.index, 0, removed);

  const result = {};
  result['sourceList'] = sourceClone;
  result['destList'] = destClone;

  return result;
}

const grid = 8;

const getItemStyle = (isDragging, draggableStyle) => ({
  borderRadius: 24,
  userSelect: 'none',
  padding: grid * 2,
  margin: `0 0 ${grid}px 0`,
  background: isDragging ? '#fafafa' : 'white',
  ...draggableStyle
});

const getListStyle = isDraggingOver => ({
  borderRadius: 24,
  background: isDraggingOver ? '#FFD5CC' : '#FFEAE5',
  width: 250,
  padding: grid,
});

class BucketImageQuestion extends React.Component {
  constructor(props){
    super(props);

    this.onDragEnd = this.onDragEnd.bind(this);

    // this.onChanged = this.onChanged.bind(this);
  }

  componentWillMount(){
    // shuffle all options and distribute evenly to each bucket
    let options = [];
    let answerBuckets = this.props.q.buckets.slice();
    answerBuckets.map(bucket => {
      options = options.concat(bucket.answers.slice());
    });
    // var totalArray = Array.from(options);
    options.sort(() => .5 - Math.random());

    // split into even groups
    var bucketSize = Math.ceil(options.length / this.props.q.buckets.length);
    var bucketGroups = options.map((item, index) => {
      return index % bucketSize === 0 ? options.slice(index, index + bucketSize) : null;
    }).filter(item => {
      return item;
    });

    let answer = [];

    bucketGroups.map((items, index) => {
      answer.push({
        label: answerBuckets[index].label,
        answers: items,
      });
    });

    this.props.onChanged(this.props.q.uid, answer);
  };

  onDragEnd = result => {
    const { source, destination } = result;
    // dropped outside the list
    if (!destination) {
      return;
    }

    let answerBuckets = this.props.q.selected;

    if (source.droppableId === destination.droppableId) {
      // change order in the same bucket
      const items = reorder(
        answerBuckets[parseInt(source.droppableId)].answers,
        source.index,
        destination.index,
      );

      answerBuckets[source.droppableId].answers = items;
    } else {
      const result = move(
        answerBuckets[parseInt(source.droppableId)].answers,
        answerBuckets[parseInt(destination.droppableId)].answers,
        source,
        destination,
      );

      // DND doesn't like droppableId being an integer so it is stored as a string
      answerBuckets[parseInt(source.droppableId)].answers = result.sourceList;
      answerBuckets[parseInt(destination.droppableId)].answers = result.destList;
    }

    this.props.onChanged(this.props.q.uid, answerBuckets);
  }

  render() {
    const { classes, q } = this.props;

    return (
      <div style = {{ marginTop: 24 }}>
          <FormLabel component="legend"> { q.question }</FormLabel>
          <DragDropContext onDragEnd={this.onDragEnd}>
            <Grid container spacing={16}>
            { q.selected.map((bucket, index) => {
              return (
                <Grid item key={bucket.label}>
                <Droppable droppableId={index.toString()}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      style={getListStyle(snapshot.isDraggingOver)}
                      {...provided.droppableProps}
                    >
                    <div style={{ marginBottom: 8, marginLeft: 8, }}><b>{ bucket.label }</b></div>
                      {bucket.answers.map((item, index) => (
                        <Draggable key={item} draggableId={item} index={index}>
                          {(provided, snapshot) => (
                            <img
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={getItemStyle(
                                snapshot.isDragging,
                                provided.draggableProps.style
                              )}
                              src={item}
                              height={q.height}
                              width={q.width}
                              alt='option' />
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
                </Grid>
              );
            })}
            </Grid>
          </DragDropContext>
        <hr />
      </div>
    )

  }
}

export default BucketImageQuestion;
