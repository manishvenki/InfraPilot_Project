import React from 'react';
import './TableComponent.css';

const TableComponent = ({ headers, data, renderRow, emptyMessage = 'No data available' }) => {
  return (
    <div className="table-wrapper">
      <table className="table-container">
        <thead>
          <tr className="table-header-row">
            {headers.map((header, idx) => (
              <th key={idx} className="table-header-cell">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data && data.length > 0 ? (
            data.map((item, index) => renderRow(item, index))
          ) : (
            <tr>
              <td colSpan={headers.length} className="table-empty-cell">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TableComponent;
