
import React from 'react';
import { TeamRole } from '../types';
import { Plus, Trash2, Users, FileDown } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ConsolidatedTeamTableProps {
  teamRoles: TeamRole[];
  onTeamRolesChange: (roles: TeamRole[]) => void;
}

const ConsolidatedTeamTable: React.FC<ConsolidatedTeamTableProps> = ({ teamRoles, onTeamRolesChange }) => {

  const handleRoleChange = (id: string, field: keyof TeamRole, value: string | number) => {
    const updatedRoles = teamRoles.map(role => 
      role.id === id ? { ...role, [field]: value } : role
    );
    onTeamRolesChange(updatedRoles);
  };

  const handleAddRow = () => {
    const newRole: TeamRole = {
      id: Math.random().toString(36).substr(2, 9),
      category: 'Nova Categoria',
      function: 'Nova Função',
      quantity: 1,
      totalHH: '0',
      responsibilities: 'Descrição das atribuições'
    };
    onTeamRolesChange([...teamRoles, newRole]);
  };

  const handleRemoveRow = (id: string) => {
    const updatedRoles = teamRoles.filter(role => role.id !== id);
    onTeamRolesChange(updatedRoles);
  };

  // Calculate totals safely (parsing strings to floats)
  const totalPeople = teamRoles.reduce((sum, role) => sum + (Number(role.quantity) || 0), 0);
  const totalHH = teamRoles.reduce((sum, role) => {
    const hhValue = parseFloat(role.totalHH);
    return sum + (isNaN(hhValue) ? 0 : hhValue);
  }, 0);

  // Defensive format
  const formatNumber = (num: number) => {
      return isFinite(num) ? num.toLocaleString('pt-BR') : '0';
  };

  const formatPercent = (val: number, total: number) => {
      if (!total || total === 0) return '0%';
      return ((val / total) * 100).toFixed(1) + '%';
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    const tableColumn = ["Categoria", "Função", "Qtd. Pessoas", "Total HH", "% do Total", "Atribuições Principais"];
    const tableRows: (string | number)[][] = [];

    teamRoles.forEach(role => {
        const rowHH = parseFloat(role.totalHH) || 0;
        const roleData = [
            role.category,
            role.function,
            role.quantity,
            role.totalHH,
            formatPercent(rowHH, totalHH),
            role.responsibilities
        ];
        tableRows.push(roleData);
    });
    
    // Add footer row for totals
    tableRows.push([
        "TOTAIS", 
        "", 
        formatNumber(totalPeople), 
        formatNumber(totalHH), 
        "100%", 
        ""
    ]);

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [22, 101, 52] }, // Dark green to match table header
        columnStyles: {
            0: { cellWidth: 25 }, // Categoria
            1: { cellWidth: 30 }, // Função
            2: { cellWidth: 15, halign: 'center' }, // Qtd
            3: { cellWidth: 20, halign: 'center' }, // Total HH
            4: { cellWidth: 15, halign: 'center' }, // %
            5: { cellWidth: 'auto' } // Atribuições
        },
        footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' }
    });

    doc.setFontSize(14);
    doc.text("Tabela Consolidada de Pessoas por Função e HH", 14, 15);
    doc.save("equipe_consolidada.pdf");
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mt-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg flex items-center text-gray-700">
          <Users className="mr-2" /> Tabela Consolidada de Pessoas por Função e HH
        </h3>
        <div className="flex space-x-2">
            <button 
            onClick={handleExportPDF}
            className="flex items-center px-3 py-1 bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors text-sm font-medium border border-green-200"
            title="Exportar para PDF"
            >
            <FileDown size={16} className="mr-1" /> Exportar PDF
            </button>
            <button 
            onClick={handleAddRow}
            className="flex items-center px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors text-sm font-medium border border-blue-200"
            >
            <Plus size={16} className="mr-1" /> Adicionar Linha
            </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
          <thead className="bg-green-800 text-white">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider border-r border-green-700">Categoria</th>
              <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider border-r border-green-700">Função</th>
              <th className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wider border-r border-green-700 w-24">Qtd. Pessoas</th>
              <th className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wider border-r border-green-700 w-32">Total HH</th>
              <th className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wider border-r border-green-700 w-24">% do Total</th>
              <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider border-r border-green-700">Atribuições Principais</th>
              <th className="px-2 py-2 text-center w-10"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {teamRoles.map((role) => {
              const rowHH = parseFloat(role.totalHH) || 0;
              return (
                <tr key={role.id} className="hover:bg-gray-50 group">
                  <td className="px-2 py-2 border-r border-gray-200">
                    <input
                      type="text"
                      value={role.category}
                      onChange={(e) => handleRoleChange(role.id, 'category', e.target.value)}
                      className="w-full text-sm bg-transparent border-b border-transparent focus:border-blue-500 focus:outline-none px-1"
                    />
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    <input
                      type="text"
                      value={role.function}
                      onChange={(e) => handleRoleChange(role.id, 'function', e.target.value)}
                      className="w-full text-sm bg-transparent border-b border-transparent focus:border-blue-500 focus:outline-none px-1"
                    />
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    <input
                      type="number"
                      min="0"
                      value={role.quantity}
                      onChange={(e) => handleRoleChange(role.id, 'quantity', parseInt(e.target.value) || 0)}
                      className="w-full text-sm text-center bg-transparent border-b border-transparent focus:border-blue-500 focus:outline-none px-1"
                    />
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    <input
                      type="text"
                      value={role.totalHH}
                      onChange={(e) => handleRoleChange(role.id, 'totalHH', e.target.value)}
                      className="w-full text-sm text-center bg-transparent border-b border-transparent focus:border-blue-500 focus:outline-none px-1"
                    />
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200 text-center text-xs text-gray-500 font-medium">
                    {formatPercent(rowHH, totalHH)}
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200">
                    <textarea
                      value={role.responsibilities}
                      onChange={(e) => handleRoleChange(role.id, 'responsibilities', e.target.value)}
                      rows={1}
                      className="w-full text-xs bg-transparent border-b border-transparent focus:border-blue-500 focus:outline-none px-1 resize-none overflow-hidden"
                      style={{ minHeight: '1.5em' }}
                      onInput={(e) => {
                          const target = e.target as HTMLTextAreaElement;
                          target.style.height = 'auto';
                          target.style.height = target.scrollHeight + 'px';
                      }}
                    />
                  </td>
                  <td className="px-2 py-2 text-center">
                    <button 
                      onClick={() => handleRemoveRow(role.id)}
                      className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remover linha"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-gray-100 font-bold text-gray-900">
             <tr>
                 <td className="px-3 py-2 border-r border-gray-300 text-right" colSpan={2}>TOTAIS</td>
                 <td className="px-3 py-2 border-r border-gray-300 text-center">{formatNumber(totalPeople)}</td>
                 <td className="px-3 py-2 border-r border-gray-300 text-center">{formatNumber(totalHH)}</td>
                 <td className="px-3 py-2 border-r border-gray-300 text-center">100%</td>
                 <td className="px-3 py-2" colSpan={2}></td>
             </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default ConsolidatedTeamTable;