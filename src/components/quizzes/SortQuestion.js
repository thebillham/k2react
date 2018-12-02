import React from 'react';

import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';

import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const grid = 8;

const getItemStyle = (isDragging, draggableStyle) => ({
  borderRadius: 24,
  userSelect: 'none',
  padding: grid * 2,
  margin: `0 ${grid}px 0 0`,
  background: isDragging ? '#fafafa' : 'white',
  ...draggableStyle
});

const getListStyle = isDraggingOver => ({
  borderRadius: 24,
  background: isDraggingOver ? '#FFD5CC' : '#FFEAE5',
  display: 'flex',
  padding: grid,
  overflow: 'auto',
});

class SortQuestion extends React.Component {
  constructor(props){
    super(props);

    this.onDragEnd = this.onDragEnd.bind(this);

    // this.onChanged = this.onChanged.bind(this);
  }

  componentWillMount(){
    var answerList = this.props.q.answers.slice();
    this.props.onChanged(this.props.q.uid, answerList.sort(() => .5 - Math.random()));
  };

  onDragEnd(result) {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const items = reorder(
      this.props.q.selected,
      result.source.index,
      result.destination.index
    );

    this.props.onChanged(this.props.q.uid, items);
  }

  render() {
    const { q } = this.props;

    return (
      <div style = {{ marginTop: 24 }}>
        <FormControl component="fieldset">
          { q.image && <img alt='' src={q.image} height='300' style={{ borderRadius: 16 }}/> }
          <FormLabel component="legend"> { q.question }</FormLabel>
          <DragDropContext onDragEnd={this.onDragEnd}>
            <Droppable droppableId="droppable" direction="horizontal">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  style={getListStyle(snapshot.isDraggingOver)}
                  {...provided.droppableProps}
                >
                  {q.selected.map((item, index) => (
                    <Draggable key={item} draggableId={item} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={getItemStyle(
                            snapshot.isDragging,
                            provided.draggableProps.style
                          )}
                        >
                          {item}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </FormControl>
        <hr />
      </div>
    )

  }
}

export default SortQuestion;
