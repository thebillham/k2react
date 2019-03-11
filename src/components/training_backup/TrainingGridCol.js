import React from "react";
import Grid from "@material-ui/core/Grid";
import QuizWidget from "./QuizWidget";
import TrainingNode from "./TrainingNode";

function TrainingGridCol(props) {
  const { node } = props;

  return (
    <Grid
      item
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      {node.type === "quiz" ? (
        <QuizWidget quiz={{ link: node.link, title: node.title }} />
      ) : (
        <TrainingNode
          node={{ title: node.title, text: node.text, links: node.links }}
        />
      )}
    </Grid>
  );
}

export default TrainingGridCol;
