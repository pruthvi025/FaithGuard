import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { LogOut, Shield, CheckCircle2, AlertTriangle, Check, XCircle, HelpCircle } from 'lucide-react'
import Layout from '../components/Layout'
import Card from '../components/Card'
import Button from '../components/Button'
import { useAdminAuth } from '../context/AdminAuthContext'

// Mock active cases data (frontend-only)
const MOCK_CASES = [
  {
    id: 'C-1024',
    type: 'Lost',
    category: 'Wallet',
    area: 'Main Gate',
    status: 'ACTIVE',
    reportedAt: '10 min ago',
    disputed: false,
  },
  {
    id: 'C-1025',
    type: 'Found',
    category: 'Phone',
    area: 'Meditation Hall',
    status: 'FOUND',
    reportedAt: '22 min ago',
    disputed: true,
  },
  {
    id: 'C-1026',
    type: 'Lost',
    category: 'Jewelry',
    area: 'North Wing',
    status: 'ACTIVE',
    reportedAt: '45 min ago',
    disputed: false,
  },
  {
    id: 'C-1027',
    type: 'Lost',
    category: 'Bag',
    area: 'Prasadam Area',
    status: 'FOUND',
    reportedAt: '1 hr ago',
    disputed: true,
  },
]

const STATUS_OPTIONS = ['ALL', 'ACTIVE', 'FOUND']
const CATEGORY_OPTIONS = ['ALL', 'Wallet', 'Phone', 'Jewelry', 'Bag']

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { adminUser, logout } = useAdminAuth()

  // Local state for active cases and filters
  const [cases, setCases] = useState(MOCK_CASES)
  const [statusFilter, setStatusFilter] = useState('ACTIVE')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [showDisputedOnly, setShowDisputedOnly] = useState(false)

  const [selectedCase, setSelectedCase] = useState(null)
  const [showForceCloseModal, setShowForceCloseModal] = useState(false)
  const [adminActionLog, setAdminActionLog] = useState([])

  // Derived list based on filters
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      if (statusFilter !== 'ALL' && c.status !== statusFilter) return false
      if (categoryFilter !== 'ALL' && c.category !== categoryFilter) return false
      if (showDisputedOnly && !c.disputed) return false
      // Active Cases dashboard only shows non-closed
      if (c.status === 'CLOSED') return false
      return true
    })
  }, [cases, statusFilter, categoryFilter, showDisputedOnly])

  const handleLogout = async () => {
    const result = await logout()
    if (result.success) {
      navigate('/admin/login', { replace: true })
    }
  }

  const openForceCloseModal = (adminCase) => {
    setSelectedCase(adminCase)
    setShowForceCloseModal(true)
  }

  const handleForceClose = () => {
    if (!selectedCase) return

    setCases((prev) =>
      prev.map((c) =>
        c.id === selectedCase.id ? { ...c, status: 'CLOSED' } : c
      ),
    )

    setAdminActionLog((prev) => [
      {
        id: `LOG-${Date.now()}`,
        caseId: selectedCase.id,
        type: 'Force Close',
        reason: 'Unresolved / abandoned (admin override)',
        timestamp: new Date().toLocaleTimeString(),
      },
      ...prev,
    ])

    setShowForceCloseModal(false)
    setSelectedCase(null)
  }

  const handleVerifyAction = (actionType) => {
    if (!selectedCase) return

    // Update frontend-only flags/badges
    if (actionType === 'desk') {
      setCases((prev) =>
        prev.map((c) =>
          c.id === selectedCase.id ? { ...c, deskRecommended: true } : c
        ),
      )
    }

    setAdminActionLog((prev) => [
      {
        id: `LOG-${Date.now()}`,
        caseId: selectedCase.id,
        type:
          actionType === 'verify'
            ? 'Verified Owner Claim'
            : actionType === 'reject'
            ? 'Rejected Claim'
            : 'Desk Recommended',
        reason: 'Dispute review completed (frontend only)',
        timestamp: new Date().toLocaleTimeString(),
      },
      ...prev,
    ])
  }

  const disputedCases = cases.filter((c) => c.disputed && c.status !== 'CLOSED')

  return (
    <Layout show3D={false}>
      <div className="min-h-screen px-4 py-6 md:py-10 bg-[#FFF7ED]">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-[#1E293B] flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#F59E0B]" />
                  Admin Case Oversight
                </h1>
                <div className="flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-full">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-semibold text-green-700">Admin Session Active</span>
                </div>
              </div>
              <p className="text-sm text-[#475569] mt-1">
                Monitor active cases, close unresolved ones, and review disputes. No personal data is shown.
              </p>
              {adminUser && (
                <p className="text-xs text-[#64748B] mt-1">
                  Admin account: {adminUser.email}
                </p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 self-start">
              <Button 
                variant="secondary" 
                size="md"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Active Cases + Filters */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="p-5 md:p-6 bg-white/95 shadow-soft">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-base md:text-lg font-semibold text-[#1E293B]">
                      Active Cases
                    </h2>
                    <p className="text-xs text-[#6B7280] mt-1">
                      Read-only case metadata. No names, contacts, or exact locations are shown.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 md:justify-end text-xs">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-1.5 rounded-full border border-gray-200 bg-white text-[#374151]"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          Status: {s}
                        </option>
                      ))}
                    </select>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="px-3 py-1.5 rounded-full border border-gray-200 bg-white text-[#374151]"
                    >
                      {CATEGORY_OPTIONS.map((c) => (
                        <option key={c} value={c}>
                          Category: {c}
                        </option>
                      ))}
                    </select>
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 bg-white text-[#374151] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showDisputedOnly}
                        onChange={(e) => setShowDisputedOnly(e.target.checked)}
                        className="w-3.5 h-3.5 rounded border-gray-300 text-[#F59E0B] focus:ring-[#F59E0B]"
                      />
                      <span>Disputed only</span>
                    </label>
                  </div>
                </div>

                <div className="overflow-x-auto border border-gray-100 rounded-2xl">
                  <table className="min-w-full text-left text-xs md:text-sm">
                    <thead className="bg-orange-50/60 text-[11px] uppercase tracking-wide text-[#6B7280]">
                      <tr>
                        <th className="px-4 py-3 md:px-6">Case ID</th>
                        <th className="px-4 py-3 md:px-6">Type</th>
                        <th className="px-4 py-3 md:px-6">Category</th>
                        <th className="px-4 py-3 md:px-6">Temple Area</th>
                        <th className="px-4 py-3 md:px-6">Status</th>
                        <th className="px-4 py-3 md:px-6">Reported</th>
                        <th className="px-4 py-3 md:px-6">Disputed</th>
                        <th className="px-4 py-3 md:px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCases.length === 0 ? (
                        <tr>
                          <td
                            colSpan={8}
                            className="px-6 py-8 text-center text-xs text-[#9CA3AF]"
                          >
                            No active cases matching the selected filters.
                          </td>
                        </tr>
                      ) : (
                        filteredCases.map((c) => (
                          <tr
                            key={c.id}
                            className="border-t border-gray-50 hover:bg-orange-50/30 transition-colors"
                          >
                            <td className="px-4 py-3 md:px-6 font-mono text-[11px] text-[#4B5563]">
                              {c.id}
                            </td>
                            <td className="px-4 py-3 md:px-6 text-[#111827] font-medium">
                              {c.type}
                            </td>
                            <td className="px-4 py-3 md:px-6 text-[#374151]">
                              {c.category}
                            </td>
                            <td className="px-4 py-3 md:px-6 text-[#4B5563]">
                              {c.area}
                            </td>
                            <td className="px-4 py-3 md:px-6">
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full border text-[11px] ${
                                  c.status === 'ACTIVE'
                                    ? 'border-orange-200 bg-orange-50 text-orange-700'
                                    : c.status === 'FOUND'
                                    ? 'border-green-200 bg-green-50 text-green-700'
                                    : 'border-gray-200 bg-gray-50 text-gray-700'
                                }`}
                              >
                                {c.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 md:px-6 text-[#6B7280]">
                              {c.reportedAt}
                            </td>
                            <td className="px-4 py-3 md:px-6">
                              {c.disputed ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full border border-red-200 bg-red-50 text-[11px] text-red-700">
                                  <AlertTriangle className="w-3 h-3" />
                                  Yes
                                </span>
                              ) : (
                                <span className="text-[11px] text-[#9CA3AF]">No</span>
                              )}
                            </td>
                            <td className="px-4 py-3 md:px-6 text-right">
                              <div className="flex justify-end gap-2">
                                {c.disputed && (
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    className="text-[11px] px-3 py-1"
                                    onClick={() => setSelectedCase(c)}
                                  >
                                    Review
                                  </Button>
                                )}
                                {(c.status === 'ACTIVE' || c.status === 'FOUND') && (
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    className="text-[11px] px-3 py-1 text-red-700 border-red-200 hover:border-red-300"
                                    onClick={() => openForceCloseModal(c)}
                                  >
                                    Force Close
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Admin Action Log (mock) */}
              <Card className="p-5 md:p-6 bg-white/95 shadow-soft">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-semibold text-[#1E293B]">
                    Admin Action Log (Mock)
                  </h2>
                  <HelpCircle className="w-4 h-4 text-[#9CA3AF]" />
                </div>
                {adminActionLog.length === 0 ? (
                  <p className="text-xs text-[#9CA3AF]">
                    No admin actions have been recorded in this session.
                  </p>
                ) : (
                  <ul className="space-y-2 max-h-48 overflow-y-auto text-xs">
                    {adminActionLog.map((entry) => (
                      <li
                        key={entry.id}
                        className="flex items-start justify-between gap-3 border-b border-gray-100 pb-2 last:border-0"
                      >
                        <div>
                          <p className="font-semibold text-[#111827]">{entry.type}</p>
                          <p className="text-[11px] text-[#4B5563]">
                            Case: <span className="font-mono">{entry.caseId}</span>
                          </p>
                          <p className="text-[11px] text-[#6B7280]">{entry.reason}</p>
                        </div>
                        <span className="text-[11px] text-[#9CA3AF] whitespace-nowrap">
                          {entry.timestamp}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>

            {/* Disputed Case Verification */}
            <div className="space-y-4">
              <Card className="p-5 md:p-6 bg-white/95 shadow-soft">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-semibold text-[#1E293B]">
                    Disputed Items
                  </h2>
                  <span className="text-xs px-2 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">
                    {disputedCases.length} open
                  </span>
                </div>
                <p className="text-xs text-[#6B7280] mb-4">
                  Admins work only with case metadata and dispute flags. No owner or finder details are visible.
                </p>

                {disputedCases.length === 0 ? (
                  <p className="text-xs text-[#9CA3AF]">
                    No disputed items at the moment.
                  </p>
                ) : (
                  <div className="space-y-2 mb-3">
                    {disputedCases.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedCase(c)}
                        className={`w-full text-left text-xs px-3 py-2 rounded-xl border ${
                          selectedCase?.id === c.id
                            ? 'border-[#F59E0B] bg-orange-50/70'
                            : 'border-gray-200 bg-white hover:border-[#F59E0B]/40'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-[11px] text-[#4B5563]">{c.id}</span>
                          <span className="text-[11px] text-[#6B7280]">{c.category}</span>
                          <span className="text-[11px] text-red-600 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Disputed
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Disputed Case Detail Panel */}
                <div className="mt-4 border-t border-gray-100 pt-4">
                  {selectedCase && selectedCase.disputed ? (
                    <div className="space-y-3 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-[#111827]">
                          Case {selectedCase.id}
                        </p>
                        {selectedCase.deskRecommended && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full border border-blue-200 bg-blue-50 text-[11px] text-blue-700">
                            <HelpCircle className="w-3 h-3" />
                            Desk recommended
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-[#4B5563]">
                        <p>Type: <span className="font-medium">{selectedCase.type}</span></p>
                        <p>Category: <span className="font-medium">{selectedCase.category}</span></p>
                        <p>Temple Area: <span className="font-medium">{selectedCase.area}</span></p>
                        <p>Status: <span className="font-medium">{selectedCase.status}</span></p>
                      </div>

                      <div className="mt-2 p-3 rounded-xl bg-orange-50 border border-orange-100">
                        <p className="text-[11px] font-semibold text-orange-800 mb-1">
                          Dispute summary (placeholder)
                        </p>
                        <p className="text-[11px] text-orange-700 leading-relaxed">
                          The reported owner and finder have raised a concern about who the item truly belongs to.
                          Admin should review the item description and chat context carefully.
                        </p>
                      </div>

                      <div className="mt-2 p-3 rounded-xl bg-gray-50 border border-gray-100">
                        <p className="text-[11px] font-semibold text-[#111827] mb-1">
                          Chat preview (read-only, anonymised)
                        </p>
                        <div className="space-y-1 text-[11px] text-[#4B5563] font-mono bg-white rounded-lg border border-gray-200 p-2">
                          <p>&gt; Person A: “Can you describe the locket engraving?”</p>
                          <p>&gt; Person B: “Small Om symbol on the inside.”</p>
                          <p>&gt; Person A: “That matches my description from the report.”</p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 pt-2">
                        <Button
                          size="sm"
                          className="flex-1 text-[11px]"
                          onClick={() => handleVerifyAction('verify')}
                        >
                          <Check className="w-3 h-3 mr-1 inline" />
                          Verify Owner Claim
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="flex-1 text-[11px] border-red-200 text-red-700 hover:border-red-300"
                          onClick={() => handleVerifyAction('reject')}
                        >
                          <XCircle className="w-3 h-3 mr-1 inline" />
                          Reject Claim
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="flex-1 text-[11px] border-blue-200 text-blue-700 hover:border-blue-300"
                          onClick={() => handleVerifyAction('desk')}
                        >
                          <HelpCircle className="w-3 h-3 mr-1 inline" />
                          Recommend Lost &amp; Found Desk
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-[#9CA3AF]">
                      Select a disputed case to view details and verification options.
                    </p>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Force Close Confirmation Modal */}
        {showForceCloseModal && selectedCase && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40 px-4">
            <Card className="max-w-md w-full bg-white shadow-2xl">
              <h3 className="text-lg font-semibold text-[#1E293B] mb-2">
                Force Close Case
              </h3>
              <p className="text-sm text-[#475569] mb-4">
                Close this case if it appears unresolved or abandoned. This will move the case out of the active list.
              </p>
              <div className="mb-4 p-3 rounded-xl bg-orange-50 border border-orange-100 text-xs text-orange-800">
                <p className="font-semibold mb-1">Case {selectedCase.id}</p>
                <p>
                  {selectedCase.type} · {selectedCase.category} · {selectedCase.area}
                </p>
              </div>
              <div className="flex gap-3 justify-end mt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    setShowForceCloseModal(false)
                    setSelectedCase(null)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  onClick={handleForceClose}
                >
                  Force Close Case
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  )
}

