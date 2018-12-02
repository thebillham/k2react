import React from 'react';

function MethodNode(props) {
  const { node } = props;

  return (
    <div style={{ margin: 24, }}>
      { node.type === 'table' && (
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
        node.type === 'image' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', }}>
            <img alt='' src={ node.src } style={{ width: '100%', }}/>
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
