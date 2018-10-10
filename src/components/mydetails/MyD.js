import React from "react";
import { connect } from "react-redux";

const mapStateToProps = state => {
  return { staff: state.staff };
};

function MyD (props) {
  return (
    <div>
    <ul>
      { props.staff.length > 1 && props.staff.map(el => (
        <li key = {el.wfm_id}>
          {el.name} <i>{el.wfm_id}</i>
        </li>
      ))}
    </ul>
  </div>
  );
}

export default connect(mapStateToProps)(MyD);
