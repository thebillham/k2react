import React from 'react';

import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { BrowserRouter as Router, Route, Link, Switch, withRouter } from "react-router-dom";
import OpenIcon from '@material-ui/icons/OpenInNew';
import EditIcon from '@material-ui/icons/Edit';

function MethodNode(props) {
  const { classes, node } = props;

  return (
    <div style={{ margin: 24, }}>
      { node.type == 'table' && (
          <table border={node.border ? node.border : 1} cellpadding="12">
            <thead style={{ backgroundColor: '#ddd'}} >
              <tr>
                {
                  node.header.map(head => {
                    return(<th>{head}</th>);
                  })
                }
              </tr>
            </thead>
            <tbody>
              {
                node.rows.map(row => {
                  return(
                    <tr>
                      {
                        row.cols.map(col => {
                          return(<td><div dangerouslySetInnerHTML={{ __html: col}} /></td>)
                        })
                      }
                    </tr>
                  )
                })
              }
            </tbody>
          </table>
        )
      }
      {
        node.type == 'image' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', }}>
            <img src={ node.src } style={{ width: '100%', }}/>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'black', }}>{ node.caption }</div>
          </div>
        )
      }
      {
        node.type === undefined && (
          <div>
            <div style={{ fontSize: 22, fontWeight: 600, color: '#004c2f'}} dangerouslySetInnerHTML={{ __html: node.title}} />
            <div style={{ color: '#444', }} dangerouslySetInnerHTML={{ __html: node.text}} />
          </div>
        )
      }
    </div>
  );
}

export default MethodNode;
