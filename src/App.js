import React, { useState } from "react";
import {
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Eye,
  Upload,
  TrendingUp,
  Users,
  FileBarChart,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

export default function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const API_URL = "https://eye-clustering.onrender.com";

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Por favor, selecione um arquivo primeiro.");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_URL}/analyze`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Erro ao processar arquivo");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b"];
  const CLUSTER_NAMES = [
    "Grupo 1: Olhos Compactos",
    "Grupo 2: Olhos Médios",
    "Grupo 3: Olhos Alongados",
  ];

  // Preparar dados para visualização
  const prepareRadarData = () => {
    if (!result) return [];
    return result.features.map((feature) => {
      const point = { feature };
      result.clusters.forEach((cluster, idx) => {
        point[`Grupo ${idx + 1}`] = cluster[feature].mean;
      });
      return point;
    });
  };

  const prepareDistributionData = () => {
    if (!result) return [];
    return result.clusters.map((cluster, idx) => ({
      name: `Grupo ${idx + 1}`,
      count: cluster.count,
      percentage: cluster.percentage,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Eye className="w-12 h-12 text-blue-600" />
            <div>
              <h1 className="text-4xl font-bold text-gray-800">
                Análise de Perfis Biométricos Oculares
              </h1>
              <p className="text-gray-600 mt-2">
                Identificação de Padrões através de Machine Learning
              </p>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Upload de Dados
          </h2>

          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <label className="cursor-pointer">
                <span className="text-blue-600 hover:text-blue-700 font-semibold">
                  Clique para selecionar
                </span>
                <span className="text-gray-600">
                  {" "}
                  ou arraste o arquivo aqui
                </span>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {file && (
                <div className="mt-4 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 inline text-green-600 mr-2" />
                  Arquivo selecionado: <strong>{file.name}</strong>
                </div>
              )}
            </div>

            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Analisando..." : "Analisar Dados"}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-800">Erro</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <Eye className="w-16 h-16 text-blue-600 animate-pulse mx-auto mb-4" />
            <p className="text-xl text-gray-700">Processando dados...</p>
            <p className="text-sm text-gray-500 mt-2">
              Realizando clustering K-means
            </p>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <Users className="w-8 h-8 text-blue-600 mb-2" />
                <p className="text-sm text-gray-600">Total de Registros</p>
                <p className="text-3xl font-bold text-gray-800">
                  {result.total_records}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <TrendingUp className="w-8 h-8 text-green-600 mb-2" />
                <p className="text-sm text-gray-600">Grupos Identificados</p>
                <p className="text-3xl font-bold text-gray-800">
                  {result.num_clusters}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <FileBarChart className="w-8 h-8 text-purple-600 mb-2" />
                <p className="text-sm text-gray-600">Variáveis Analisadas</p>
                <p className="text-3xl font-bold text-gray-800">
                  {result.features.length}
                </p>
              </div>
            </div>

            {/* Distribution Chart */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Distribuição dos Grupos
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={prepareDistributionData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {prepareDistributionData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Radar Chart */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Perfil Comparativo dos Grupos
              </h2>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={prepareRadarData()}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="feature" />
                  <PolarRadiusAxis />
                  {result.clusters.map((_, idx) => (
                    <Radar
                      key={idx}
                      name={`Grupo ${idx + 1}`}
                      dataKey={`Grupo ${idx + 1}`}
                      stroke={COLORS[idx]}
                      fill={COLORS[idx]}
                      fillOpacity={0.3}
                    />
                  ))}
                  <Legend />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Detailed Cluster Stats */}
            <div className="grid grid-cols-1 gap-6">
              {result.clusters.map((cluster, idx) => (
                <div key={idx} className="bg-white rounded-2xl shadow-xl p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: COLORS[idx] }}
                    />
                    <h2 className="text-2xl font-bold text-gray-800">
                      {CLUSTER_NAMES[idx]}
                    </h2>
                    <span className="ml-auto text-sm bg-gray-100 px-3 py-1 rounded-full">
                      {cluster.count} olhos ({cluster.percentage}%)
                    </span>
                  </div>

                  <div className="grid grid-cols-5 gap-4">
                    {result.features.map((feature) => (
                      <div key={feature} className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm font-semibold text-gray-600 mb-2">
                          {feature}
                        </p>
                        <p className="text-2xl font-bold text-gray-800">
                          {cluster[feature].mean}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          ±{cluster[feature].std}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          [{cluster[feature].min} - {cluster[feature].max}]
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* // {cluster.correct_frequency !== null && (
                  //   <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  //     <p className="text-sm text-gray-600">
                  //       <span className="font-semibold">
                  //         Informação Complementar:
                  //       </span>{" "}
                  //       Taxa de acurácia neste grupo:{" "}
                  //       {cluster.correct_frequency}%
                  //     </p>
                  //   </div>
                  // )} */}

                  <div
                    className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-l-4"
                    style={{ borderColor: COLORS[idx] }}
                  >
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                      💡 Interpretação Clínica:
                    </p>
                    <p className="text-sm text-gray-600">
                      {idx === 0 &&
                        "Olhos com comprimento axial menor e câmara anterior mais rasa. Típico de olhos hipermétropes ou de estrutura mais compacta."}
                      {idx === 1 &&
                        "Características biométricas dentro da média populacional. Representa o padrão mais comum de olhos emétropes."}
                      {idx === 2 &&
                        "Olhos com maior comprimento axial, geralmente associados a miopia. Apresentam câmara anterior mais profunda."}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Conclusions */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-8 mt-8 text-white">
              <h2 className="text-2xl font-bold mb-4">Conclusões da Análise</h2>
              <ul className="space-y-2">
                <li>
                  ✓ Identificamos {result.num_clusters} perfis distintos de
                  olhos baseados em medidas biométricas
                </li>
                <li>
                  ✓ O algoritmo de clustering K-means segmentou{" "}
                  {result.total_records} registros com base em 5 variáveis: AL,
                  ACD, WTW, K1 e K2
                </li>
                <li>
                  ✓ Cada grupo apresenta características únicas que podem
                  auxiliar em decisões clínicas e cirúrgicas
                </li>
                <li>
                  ✓ A distribuição dos grupos reflete a diversidade anatômica
                  natural da população
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
