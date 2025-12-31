import React from 'react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'



const DisplayTable = ({ data, column }) => {
  const table = useReactTable({
    data,
    columns : column,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id} className="bg-[#F1F5F9]">
              {headerGroup.headers.map((header, index) => (
                <th
                  key={header.id}
                  className={`px-3 sm:px-4 py-2.5 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-[#475569] uppercase tracking-wide border-b border-[#E2E8F0] ${
                    index === 1 ? 'w-32 min-w-[120px]' : ''
                  }`}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row, index) => (
            <tr 
              key={row.id}
              className="bg-white hover:bg-[#F1F5F9] transition-colors border-b border-[#E2E8F0] last:border-b-0"
            >
              {row.getVisibleCells().map((cell, cellIndex) => (
                <td
                  key={cell.id}
                  className={`px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-[#0F172A] ${
                    cellIndex === 1 ? 'w-32 min-w-[120px]' : ''
                  }`}
                >
                  {flexRender(
                    cell.column.columnDef.cell,
                    cell.getContext()
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default DisplayTable