'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSA } from '@/lib/sa-context'
import {
  getServiceAccount,
  updateServiceAccount,
  getMembers,
  addMember,
  enrollMember,
  updateMember,
  removeMember,
} from '@/lib/sa-api'
import type {
  SADetail,
  SAMember,
  SARoleCode,
  SAMembershipState,
} from '@/lib/sa-types'
import FeedbackModal from '@/components/feedback-modal'
import { useAlert } from '@/app/contexts/alertContext'

const roleBadge: Record<string, string> = {
  admin: 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300',
  staff: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
  agent: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
}

const memberStateBadge: Record<string, string> = {
  active: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
  suspended: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
  revoked: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
}

export default function ServiceAccountDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { isAdmin } = useSA()
  const { alert } = useAlert()
  const saId = Number(params.id)

  const [sa, setSA] = useState<SADetail | null>(null)
  const [members, setMembers] = useState<SAMember[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Edit form state
  const [editName, setEditName] = useState('')
  const [editState, setEditState] = useState<'active' | 'inactive'>('active')
  const [editNote, setEditNote] = useState('')

  // Add member form
  const [showAddMember, setShowAddMember] = useState(false)
  const [addPartnerId, setAddPartnerId] = useState('')
  const [addRole, setAddRole] = useState<SARoleCode>('agent')
  const [addingMember, setAddingMember] = useState(false)

  // Enroll form
  const [showEnroll, setShowEnroll] = useState(false)
  const [enrollName, setEnrollName] = useState('')
  const [enrollEmail, setEnrollEmail] = useState('')
  const [enrollPhone, setEnrollPhone] = useState('')
  const [enrollRole, setEnrollRole] = useState<SARoleCode>('agent')
  const [enrollEmployeeRole, setEnrollEmployeeRole] = useState<'salesrep' | 'salesattendant'>('salesrep')
  const [enrolling, setEnrolling] = useState(false)

  // Revoke member
  const [revokeTarget, setRevokeTarget] = useState<SAMember | null>(null)
  const [revoking, setRevoking] = useState(false)

  const fetchSA = useCallback(async () => {
    try {
      const res = await getServiceAccount(saId)
      setSA(res.service_account)
      setEditName(res.service_account.name)
      setEditState(res.service_account.state)
      setEditNote(res.service_account.note ?? '')
    } catch {
      alert({ text: 'Failed to load service account.', type: 'error' })
    }
  }, [saId, alert])

  const fetchMembers = useCallback(async () => {
    try {
      const res = await getMembers(saId)
      setMembers(res.members ?? [])
    } catch { /* allow empty */ }
  }, [saId])

  useEffect(() => {
    setLoading(true)
    Promise.all([fetchSA(), fetchMembers()]).finally(() => setLoading(false))
  }, [fetchSA, fetchMembers])

  useEffect(() => {
    if (!isAdmin) router.push('/portal')
  }, [isAdmin, router])

  async function handleSaveDetails() {
    setSaving(true)
    try {
      await updateServiceAccount(saId, { name: editName, state: editState, note: editNote || undefined })
      alert({ text: 'Account updated successfully.', type: 'success' })
      fetchSA()
    } catch (e: unknown) {
      alert({ text: e instanceof Error ? e.message : 'Update failed.', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  async function handleAddMember() {
    if (!addPartnerId) return
    setAddingMember(true)
    try {
      await addMember(saId, { person_partner_id: Number(addPartnerId), role_code: addRole })
      alert({ text: 'Member added successfully.', type: 'success' })
      setShowAddMember(false)
      setAddPartnerId('')
      fetchMembers()
    } catch (e: unknown) {
      alert({ text: e instanceof Error ? e.message : 'Failed to add member.', type: 'error' })
    } finally {
      setAddingMember(false)
    }
  }

  async function handleEnroll() {
    if (!enrollName || !enrollEmail) return
    setEnrolling(true)
    try {
      const res = await enrollMember(saId, {
        name: enrollName,
        email: enrollEmail,
        phone: enrollPhone || undefined,
        role_code: enrollRole,
        employee_role: enrollEmployeeRole,
      })
      const pwd = res.generated_password
      alert({
        text: pwd ? `Enrolled successfully. Generated password: ${pwd}` : 'Enrolled successfully.',
        type: 'success',
      })
      setShowEnroll(false)
      setEnrollName('')
      setEnrollEmail('')
      setEnrollPhone('')
      fetchMembers()
    } catch (e: unknown) {
      alert({ text: e instanceof Error ? e.message : 'Enrollment failed.', type: 'error' })
    } finally {
      setEnrolling(false)
    }
  }

  async function handleRevoke() {
    if (!revokeTarget) return
    setRevoking(true)
    try {
      await removeMember(saId, revokeTarget.id)
      alert({ text: 'Membership revoked.', type: 'success' })
      setRevokeTarget(null)
      fetchMembers()
    } catch (e: unknown) {
      alert({ text: e instanceof Error ? e.message : 'Revoke failed.', type: 'error' })
    } finally {
      setRevoking(false)
    }
  }

  async function handleRoleChange(member: SAMember, newRole: SARoleCode) {
    try {
      await updateMember(saId, member.id, { role_code: newRole })
      fetchMembers()
    } catch (e: unknown) {
      alert({ text: e instanceof Error ? e.message : 'Failed to update role.', type: 'error' })
    }
  }

  async function handleStateChange(member: SAMember, newState: SAMembershipState) {
    try {
      await updateMember(saId, member.id, { membership_state: newState })
      fetchMembers()
    } catch (e: unknown) {
      alert({ text: e instanceof Error ? e.message : 'Failed to update state.', type: 'error' })
    }
  }

  if (!isAdmin) return null

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
        <div className="text-gray-400 py-12 text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        <Link href="/portal" className="hover:text-violet-500">Portal</Link>
        <span className="mx-2">/</span>
        <Link href="/portal/service-accounts" className="hover:text-violet-500">Service Accounts</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800 dark:text-gray-100 font-medium">{sa?.name ?? 'Account'}</span>
      </nav>

      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
          {sa?.name ?? 'Service Account'}
        </h1>
      </div>

      {/* Account Details Card */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700/60 mb-6">
        <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100">Account Details</h2>
        </header>
        <div className="p-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="edit-name">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                id="edit-name"
                className="form-input w-full"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="edit-state">
                State
              </label>
              <select
                id="edit-state"
                className="form-select w-full"
                value={editState}
                onChange={(e) => setEditState(e.target.value as 'active' | 'inactive')}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-500 dark:text-gray-400">
                Account Class
              </label>
              <div className="text-sm text-gray-800 dark:text-gray-100 py-2">
                {sa?.account_class || '-'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-500 dark:text-gray-400">
                Account Code
              </label>
              <div className="text-sm text-gray-800 dark:text-gray-100 py-2">
                {sa?.account_code || '—'}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1" htmlFor="edit-note">
                Note
              </label>
              <textarea
                id="edit-note"
                className="form-textarea w-full"
                rows={3}
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
              />
            </div>
          </div>
        </div>
        <footer className="px-5 py-4 border-t border-gray-100 dark:border-gray-700/60">
          <div className="flex items-center justify-between">
            <Link
              href="/portal/service-accounts"
              className="btn border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-gray-800 dark:text-gray-300"
            >
              Cancel
            </Link>
            <button
              onClick={handleSaveDetails}
              disabled={saving}
              className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white ml-3"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </footer>
      </div>

      {/* Members Card */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700/60">
        <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60 sm:flex sm:justify-between sm:items-center">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-2 sm:mb-0">Members</h2>
          <div className="flex gap-2">
            <button
              onClick={() => { setShowAddMember(!showAddMember); setShowEnroll(false) }}
              className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white text-sm"
            >
              Add Existing
            </button>
            <button
              onClick={() => { setShowEnroll(!showEnroll); setShowAddMember(false) }}
              className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white text-sm"
            >
              Enroll New
            </button>
          </div>
        </header>

        {/* Add member form */}
        {showAddMember && (
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60 bg-gray-50 dark:bg-gray-900/20">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">Add Existing Member</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="add-partner-id">Partner ID</label>
                <input
                  id="add-partner-id"
                  className="form-input w-full"
                  type="number"
                  value={addPartnerId}
                  onChange={(e) => setAddPartnerId(e.target.value)}
                  placeholder="e.g. 11360"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="add-role">Role</label>
                <select
                  id="add-role"
                  className="form-select w-full"
                  value={addRole}
                  onChange={(e) => setAddRole(e.target.value as SARoleCode)}
                >
                  <option value="admin">Admin</option>
                  <option value="staff">Staff</option>
                  <option value="agent">Agent</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end mt-3">
              <button
                onClick={handleAddMember}
                disabled={addingMember}
                className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white text-sm"
              >
                {addingMember ? 'Adding...' : 'Add Member'}
              </button>
            </div>
          </div>
        )}

        {/* Enroll form */}
        {showEnroll && (
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60 bg-gray-50 dark:bg-gray-900/20">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">Enroll New Person</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="enroll-name">Full Name</label>
                <input
                  id="enroll-name"
                  className="form-input w-full"
                  value={enrollName}
                  onChange={(e) => setEnrollName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="enroll-email">Email</label>
                <input
                  id="enroll-email"
                  className="form-input w-full"
                  type="email"
                  value={enrollEmail}
                  onChange={(e) => setEnrollEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="enroll-phone">Phone</label>
                <input
                  id="enroll-phone"
                  className="form-input w-full"
                  value={enrollPhone}
                  onChange={(e) => setEnrollPhone(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="enroll-role">SA Role</label>
                <select
                  id="enroll-role"
                  className="form-select w-full"
                  value={enrollRole}
                  onChange={(e) => setEnrollRole(e.target.value as SARoleCode)}
                >
                  <option value="admin">Admin</option>
                  <option value="staff">Staff</option>
                  <option value="agent">Agent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="enroll-employee-role">Employee Role</label>
                <select
                  id="enroll-employee-role"
                  className="form-select w-full"
                  value={enrollEmployeeRole}
                  onChange={(e) => setEnrollEmployeeRole(e.target.value as 'salesrep' | 'salesattendant')}
                >
                  <option value="salesrep">Sales Rep</option>
                  <option value="salesattendant">Sales Attendant</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end mt-3">
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white text-sm"
              >
                {enrolling ? 'Enrolling...' : 'Enroll'}
              </button>
            </div>
          </div>
        )}

        {/* Members table */}
        <div className="overflow-x-auto">
          <table className="table-auto w-full divide-y divide-gray-100 dark:divide-gray-700/60">
            <thead className="text-xs uppercase text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-900/20 border-t border-gray-100 dark:border-gray-700/60">
              <tr>
                <th className="px-4 py-3 whitespace-nowrap text-left font-semibold">Name</th>
                <th className="px-4 py-3 whitespace-nowrap text-left font-semibold">Email</th>
                <th className="px-4 py-3 whitespace-nowrap text-left font-semibold">Role</th>
                <th className="px-4 py-3 whitespace-nowrap text-left font-semibold">State</th>
                <th className="px-4 py-3 whitespace-nowrap text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-700/60">
              {members.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                    No members yet.
                  </td>
                </tr>
              )}
              {members.map((m) => (
                <tr key={m.id}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="font-medium text-gray-800 dark:text-gray-100">{m.person_name}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-500 dark:text-gray-400">
                    {m.person_email ?? '—'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <select
                      value={m.role_code}
                      onChange={(e) => handleRoleChange(m, e.target.value as SARoleCode)}
                      className={`text-xs font-medium px-2 py-0.5 rounded-full border-0 cursor-pointer ${roleBadge[m.role_code] ?? roleBadge.agent}`}
                    >
                      <option value="admin">Admin</option>
                      <option value="staff">Staff</option>
                      <option value="agent">Agent</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <select
                      value={m.membership_state}
                      onChange={(e) => handleStateChange(m, e.target.value as SAMembershipState)}
                      className={`text-xs font-medium px-2 py-0.5 rounded-full border-0 cursor-pointer ${memberStateBadge[m.membership_state] ?? memberStateBadge.active}`}
                    >
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="revoked">Revoked</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <button
                      onClick={() => setRevokeTarget(m)}
                      className="text-red-500 hover:text-red-600 text-xs font-medium"
                    >
                      Revoke
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <FeedbackModal
        isOpen={!!revokeTarget}
        setIsOpen={(open: boolean) => { if (!open) setRevokeTarget(null) }}
        title="Revoke Membership"
        content={`Revoke membership for "${revokeTarget?.person_name}"? They will lose access to this service account.`}
        variant="danger"
        confirmButtonLabel={revoking ? 'Revoking...' : 'Revoke'}
        onConfirm={handleRevoke}
        onCancel={() => setRevokeTarget(null)}
      />
    </div>
  )
}
