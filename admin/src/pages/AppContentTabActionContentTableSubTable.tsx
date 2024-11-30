import React, { Component } from 'react';
import { Table, TableBody, TableCell, TableRow } from '@mui/material';
import { handleMouseOut, handleMouseOver } from '../lib/dragNDrop.js';
import { getElementIcon } from '../lib/actionUtils.js';
import type { PropsSubTable } from 'admin/app.js';

class SubTable extends Component<PropsSubTable> {
    render(): React.ReactNode {
        return (
            <Table>
                <TableBody className="dynamicHeight">
                    {typeof this.props.data != 'string' && this.props.data != null && this.props.data != undefined
                        ? this.props.data.map((element, index) => (
                              <TableRow
                                  key={index}
                                  className="SubTable"
                              >
                                  <TableCell style={{ padding: '0', border: 'none' }}>
                                      <span
                                          draggable={false}
                                          className="noneDraggable"
                                          onMouseOver={e => handleMouseOver(e)}
                                          onMouseLeave={e => handleMouseOut(e)}
                                      >
                                          {this.props.name != 'values'
                                              ? getElementIcon(element, this.props.entry)
                                              : element}
                                      </span>
                                  </TableCell>
                              </TableRow>
                          ))
                        : null}
                </TableBody>
            </Table>
        );
    }
}

export default SubTable;
