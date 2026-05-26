import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Flag, BarChart3, AlertCircle, CheckCircle, Trash2, Ban } from 'lucide-react';
import api from '../api';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeSubTab, setActiveSubTab] = useState('analytics'); // 'analytics' or 'reports'
  
  // Reports State
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(true);

  // Analytics State
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Authorization Check
  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (activeSubTab === 'reports') {
      loadReports();
    } else {
      loadAnalytics();
    }
  }, [activeSubTab]);

  const loadReports = async () => {
    setReportsLoading(true);
    try {
      const res = await api.get('/api/admin/reports');
      setReports(res.data);
    } catch (err) {
      console.error("Failed to load reports queue", err);
    } finally {
      setReportsLoading(false);
    }
  };

  const loadAnalytics = async () => {
    setStatsLoading(true);
    try {
      const res = await api.get('/api/admin/analytics');
      setStats(res.data);
    } catch (err) {
      console.error("Failed to load analytics statistics", err);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleResolveReport = async (id) => {
    try {
      await api.post(`/api/admin/reports/${id}/resolve`);
      setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'RESOLVED' } : r));
    } catch (err) {
      alert("Failed to resolve report");
    }
  };

  const handleBlockUser = async (userId) => {
    if (window.confirm("Are you sure you want to block this user? They will be locked out of the application immediately.")) {
      try {
        await api.post(`/api/admin/users/${userId}/block`);
        alert("User blocked successfully. Verification lock enabled.");
      } catch (err) {
        alert("Failed to block user");
      }
    }
  };

  const handleRemoveProduct = async (productId, reportId) => {
    if (window.confirm("Are you sure you want to delete this listing from the portal?")) {
      try {
        await api.delete(`/api/products/${productId}`);
        alert("Listing removed successfully.");
        if (reportId) {
          handleResolveReport(reportId);
        }
      } catch (err) {
        alert("Failed to delete listing");
      }
    }
  };

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-rose-600 font-bold">
        Access Denied. Administrator privileges required.
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 text-left flex flex-col gap-6">
      <div className="bg-linear-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/10 rounded-2xl">
            <ShieldCheck size={28} className="text-blue-400 stroke-2" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">Admin Moderation Hub</h2>
            <p className="text-xs text-slate-300 font-medium mt-0.5">Manage safety, review reports, and check platform analytics.</p>
          </div>
        </div>

        {/* Tab triggers */}
        <div className="flex bg-white/10 rounded-xl p-1 shrink-0">
          <button
            onClick={() => setActiveSubTab('analytics')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-smooth flex items-center gap-1.5 ${activeSubTab === 'analytics' ? 'bg-white text-slate-900' : 'text-slate-300 hover:text-white'}`}
          >
            <BarChart3 size={14} />
            <span className="hidden sm:inline">Analytics</span>
          </button>
          <button
            onClick={() => setActiveSubTab('reports')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-smooth flex items-center gap-1.5 ${activeSubTab === 'reports' ? 'bg-white text-slate-900' : 'text-slate-300 hover:text-white'}`}
          >
            <Flag size={14} />
            <span className="hidden sm:inline">Moderation Reports</span>
          </button>
        </div>
      </div>

      {/* 1. Tab: Analytics view */}
      {activeSubTab === 'analytics' && (
        <div className="space-y-6">
          {statsLoading ? (
            <div className="py-12 text-center text-gray-400">Compiling analytics metrics...</div>
          ) : stats ? (
            <>
              {/* Statistical cards grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-2xs">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Users</span>
                  <p className="text-2xl font-black text-gray-800 mt-2">{stats.totalUsers}</p>
                  <span className="text-[10px] text-emerald-600 font-bold block mt-1">{stats.verifiedUsers} verified</span>
                </div>
                <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-2xs">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Listings</span>
                  <p className="text-2xl font-black text-gray-800 mt-2">{stats.activeListings}</p>
                  <span className="text-[10px] text-gray-400 font-bold block mt-1">Available for sale</span>
                </div>
                <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-2xs">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sold Items</span>
                  <p className="text-2xl font-black text-emerald-600 mt-2">{stats.soldListings}</p>
                  <span className="text-[10px] text-gray-400 font-bold block mt-1">Total transaction count</span>
                </div>
                <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-2xs">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sales Volume</span>
                  <p className="text-2xl font-black text-primary mt-2">₹{stats.totalSalesVolume || 0}</p>
                  <span className="text-[10px] text-gray-400 font-bold block mt-1">Trade value on campus</span>
                </div>
              </div>

              {/* Bar charts for search logs */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Search Categories */}
                <div className="p-6 bg-white border border-gray-100 rounded-3xl shadow-xs">
                  <h3 className="font-black text-sm text-gray-800 mb-6">Top Searched Categories</h3>
                  <div className="flex flex-col gap-4">
                    {stats.topCategories && stats.topCategories.length > 0 ? (
                      stats.topCategories.map((item, idx) => {
                        const maxCount = stats.topCategories[0].count;
                        const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                        return (
                          <div key={idx} className="space-y-1.5 text-xs text-left">
                            <div className="flex justify-between font-bold text-gray-600">
                              <span>{item.category}</span>
                              <span className="text-primary">{item.count} searches</span>
                            </div>
                            <div className="w-full bg-gray-50 h-3 rounded-full overflow-hidden border border-gray-100">
                              <div 
                                className="bg-primary h-full rounded-full transition-smooth"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-xs text-gray-400 py-6 text-center">No search query analytics recorded yet</div>
                    )}
                  </div>
                </div>

                {/* Search Query Keywords */}
                <div className="p-6 bg-white border border-gray-100 rounded-3xl shadow-xs">
                  <h3 className="font-black text-sm text-gray-800 mb-6">Popular Search Queries</h3>
                  <div className="flex flex-col gap-4">
                    {stats.topQueries && stats.topQueries.length > 0 ? (
                      stats.topQueries.map((item, idx) => {
                        const maxCount = stats.topQueries[0].count;
                        const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                        return (
                          <div key={idx} className="space-y-1.5 text-xs text-left">
                            <div className="flex justify-between font-bold text-gray-600">
                              <span>"{item.query}"</span>
                              <span className="text-indigo-500">{item.count} searches</span>
                            </div>
                            <div className="w-full bg-gray-50 h-3 rounded-full overflow-hidden border border-gray-100">
                              <div 
                                className="bg-indigo-500 h-full rounded-full transition-smooth"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-xs text-gray-400 py-6 text-center">No search keyword analytics recorded yet</div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-gray-400">Failed to render stats</div>
          )}
        </div>
      )}

      {/* 2. Tab: Moderation reports */}
      {activeSubTab === 'reports' && (
        <div className="bg-white border border-gray-100 rounded-3xl shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-black text-sm text-gray-800">Pending Safety Flags</h3>
            <span className="px-2.5 py-0.5 bg-rose-100 text-rose-700 rounded-full text-[10px] font-bold">
              {reports.filter(r => r.status === 'PENDING').length} open
            </span>
          </div>

          <div className="overflow-x-auto no-scrollbar">
            {reportsLoading ? (
              <div className="py-12 text-center text-gray-400 text-xs">Loading logs...</div>
            ) : reports.length > 0 ? (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider">
                    <th className="p-4">Report Details</th>
                    <th className="p-4">Reported Listing</th>
                    <th className="p-4">Reported User</th>
                    <th className="p-4">Reporter</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {reports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50/30 transition-colors">
                      {/* Reason */}
                      <td className="p-4 align-top max-w-[200px]">
                        <p className="font-semibold text-gray-800">{report.reason}</p>
                        <span className="text-[10px] text-gray-400 block mt-1">
                          {new Date(report.createdAt).toLocaleString()}
                        </span>
                        <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          report.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {report.status}
                        </span>
                      </td>

                      {/* Product */}
                      <td className="p-4 align-top">
                        {report.reportedProduct ? (
                          <div className="flex flex-col gap-1 text-left">
                            <Link to={`/products/${report.reportedProduct.id}`} className="font-bold text-primary hover:underline">
                              {report.reportedProduct.title}
                            </Link>
                            <span className="text-[10px] text-gray-400">₹{report.reportedProduct.price}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">No listing flagged</span>
                        )}
                      </td>

                      {/* Flagged User */}
                      <td className="p-4 align-top">
                        {report.reportedUser ? (
                          <div className="flex flex-col text-left">
                            <span className="font-bold text-gray-700">{report.reportedUser.name}</span>
                            <span className="text-[10px] text-gray-400">{report.reportedUser.collegeEmail}</span>
                          </div>
                        ) : report.reportedProduct?.seller ? (
                          <div className="flex flex-col text-left">
                            <span className="font-bold text-gray-700">{report.reportedProduct.seller.name} (Seller)</span>
                            <span className="text-[10px] text-gray-400">{report.reportedProduct.seller.collegeEmail}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">No user flagged</span>
                        )}
                      </td>

                      {/* Reporter */}
                      <td className="p-4 align-top">
                        <div className="flex flex-col text-left">
                          <span className="font-semibold text-gray-700">{report.reporter.name}</span>
                          <span className="text-[10px] text-gray-400">{report.reporter.collegeEmail}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4 align-top">
                        <div className="flex items-center justify-center gap-2">
                          {report.status === 'PENDING' ? (
                            <>
                              {report.reportedProduct && (
                                <button
                                  onClick={() => handleRemoveProduct(report.reportedProduct.id, report.id)}
                                  className="p-1.5 hover:bg-rose-50 text-rose-500 rounded-lg transition-colors"
                                  title="Delete Flagged Product"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                              {report.reportedUser && (
                                <button
                                  onClick={() => handleBlockUser(report.reportedUser.id)}
                                  className="p-1.5 hover:bg-rose-50 text-rose-500 rounded-lg transition-colors"
                                  title="Block Offending User"
                                >
                                  <Ban size={14} />
                                </button>
                              )}
                              <button
                                onClick={() => handleResolveReport(report.id)}
                                className="p-1.5 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors"
                                title="Mark Flag as Resolved"
                              >
                                <CheckCircle size={14} />
                              </button>
                            </>
                          ) : (
                            <span className="text-gray-400 text-[10px] font-bold">Resolved</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-16 text-center text-gray-400 font-semibold p-8">
                No safety flags in queue. Excellent job!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
