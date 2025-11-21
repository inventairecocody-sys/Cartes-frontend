import React from "react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  CartesianGrid
} from "recharts";

interface ChartCartesProps {
  data: { site: string; total: number; retirees: number }[];
  title?: string;
  height?: number;
}

const ChartCartes: React.FC<ChartCartesProps> = ({ 
  data, 
  title = "Statistiques des Cartes par Site",
  height = 300 
}) => {
  // Format personnalisé pour le tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-lg border border-orange-200 rounded-2xl p-4 shadow-xl">
          <p className="font-semibold text-gray-800 mb-2">{`Site: ${label}`}</p>
          <div className="space-y-1">
            <p className="text-sm flex items-center gap-2">
              <span className="w-3 h-3 bg-[#0077B6] rounded-full"></span>
              <span className="text-gray-600">Total:</span>
              <span className="font-semibold text-[#0077B6]">{payload[0].value.toLocaleString()}</span>
            </p>
            <p className="text-sm flex items-center gap-2">
              <span className="w-3 h-3 bg-[#2E8B57] rounded-full"></span>
              <span className="text-gray-600">Retirées:</span>
              <span className="font-semibold text-[#2E8B57]">{payload[1].value.toLocaleString()}</span>
            </p>
            <div className="border-t border-gray-200 mt-2 pt-2">
              <p className="text-sm text-gray-600">
                Disponibles: <span className="font-semibold text-[#F77F00]">
                  {(payload[0].value - payload[1].value).toLocaleString()}
                </span>
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Format personnalisé pour la légende
  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <div className="flex justify-center gap-6 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm font-medium text-gray-700">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-orange-100 p-6">
      {/* En-tête du graphique */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-[#F77F00] to-[#FF9E40] rounded-xl flex items-center justify-center">
          <span className="text-white text-lg">📊</span>
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <p className="text-gray-600 text-sm">Répartition des cartes par site de retrait</p>
        </div>
      </div>

      {/* Graphique */}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#f0f0f0" 
            vertical={false}
          />
          <XAxis 
            dataKey="site"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6B7280', fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6B7280', fontSize: 12 }}
            width={60}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend content={renderLegend} />
          <Bar 
            dataKey="total" 
            name="Total des cartes"
            fill="#0077B6"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
          <Bar 
            dataKey="retirees" 
            name="Cartes retirées"
            fill="#2E8B57"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Légende supplémentaire */}
      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#F77F00] rounded-full"></div>
          <span className="text-sm font-medium text-gray-700">
            Disponibles: {data.reduce((sum, item) => sum + (item.total - item.retirees), 0).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChartCartes;