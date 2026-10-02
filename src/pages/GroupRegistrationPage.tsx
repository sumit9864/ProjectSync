import { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Lock,
  ShieldAlert,
  CalendarClock,
} from 'lucide-react';
import { Card, CardHeader, CardBody, Button, Badge } from '@/components/ui';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useToast } from '@/components/Toast';
import { electives, registrationWindow, groupName as existingGroupName, teamMembers } from '@/data/mockData';

type MemberRow = {
  id: string;
  name: string;
  rollNumber: string;
  email: string;
  elective: string;
};

type Errors = {
  groupName?: string;
  description?: string;
  members?: string;
  memberErrors: { rollNumber?: string; name?: string; email?: string; elective?: string }[];
};

export function GroupRegistrationPage() {
  const [loading, setLoading] = useState(true);
  const [groupName, setGroupName] = useState(existingGroupName);
  const [description, setDescription] = useState(
    'A transformer-based early-warning system for cardiovascular anomalies using wearable ECG data.'
  );
  const [members, setMembers] = useState<MemberRow[]>(
    teamMembers.map((m) => ({
      id: m.id,
      name: m.name,
      rollNumber: m.rollNumber,
      email: m.email,
      elective: m.elective,
    }))
  );
  const [errors, setErrors] = useState<Errors>({ memberErrors: [] });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const addMember = () => {
    if (members.length >= 4) return;
    setMembers((prev) => [
      ...prev,
      { id: `m-${Date.now()}`, name: '', rollNumber: '', email: '', elective: '' },
    ]);
  };

  const removeMember = (id: string) => {
    if (members.length <= 3) return;
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setErrors({ memberErrors: [] });
  };

  const updateMember = (id: string, field: keyof MemberRow, value: string) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
    setErrors({ memberErrors: [] });
  };

  const validate = (): boolean => {
    const newErrors: Errors = { memberErrors: members.map(() => ({})) };
    let hasError = false;

    if (!groupName.trim()) {
      newErrors.groupName = 'Group name is required.';
      hasError = true;
    } else if (groupName.trim().toLowerCase() === 'byte brigade') {
      newErrors.groupName = 'This group name is already taken. Choose another.';
      hasError = true;
    }

    if (!description.trim()) {
      newErrors.description = 'A one-line description is required.';
      hasError = true;
    }

    if (members.length < 3) {
      newErrors.members = 'You need at least 3 team members.';
      hasError = true;
    } else if (members.length > 4) {
      newErrors.members = 'You can have at most 4 team members.';
      hasError = true;
    }

    const rollSet = new Map<string, number>();
    members.forEach((m, i) => {
      if (!m.name.trim()) {
        newErrors.memberErrors![i].name = 'Name is required.';
        hasError = true;
      }
      if (!m.rollNumber.trim()) {
        newErrors.memberErrors![i].rollNumber = 'Roll number is required.';
        hasError = true;
      } else {
        const count = rollSet.get(m.rollNumber.trim().toLowerCase()) ?? 0;
        rollSet.set(m.rollNumber.trim().toLowerCase(), count + 1);
        if (count > 0) {
          newErrors.memberErrors![i].rollNumber = 'Duplicate roll number.';
          hasError = true;
        }
      }
      if (!m.email.trim()) {
        newErrors.memberErrors![i].email = 'Email is required.';
        hasError = true;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m.email.trim())) {
        newErrors.memberErrors![i].email = 'Enter a valid email address.';
        hasError = true;
      }
      if (!m.elective) {
        newErrors.memberErrors![i].elective = 'Select an elective.';
        hasError = true;
      }
    });

    const electivesUsed = new Set(members.map((m) => m.elective).filter(Boolean));
    if (electivesUsed.size > 1) {
      newErrors.members = 'All team members must be in the same elective.';
      hasError = true;
    }

    setErrors(newErrors);
    return !hasError;
  };

  const handleSubmitClick = () => {
    if (validate()) {
      setConfirmOpen(true);
    } else {
      showToast('Please fix the errors before submitting.', 'error');
    }
  };

  const handleConfirmSubmit = () => {
    setConfirmOpen(false);
    setSubmitted(true);
    showToast('Group registration confirmed successfully.', 'success');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-8 w-48 rounded-md" />
        {[0, 1].map((i) => (
          <div key={i} className="skeleton h-64 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-ink-100">Group Registration</h1>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
          Register your project group. This is a one-way action and cannot be changed once submitted.
        </p>
      </div>

      {/* Registration window indicator */}
      <Card
        className={`border-l-4 ${registrationWindow.open ? 'border-l-emerald-400' : 'border-l-rose-400'}`}
      >
        <CardBody className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                registrationWindow.open ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
              }`}
            >
              <CalendarClock className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-display font-semibold text-ink-900 dark:text-ink-100">Registration Window</p>
                <Badge color={registrationWindow.open ? 'success' : 'error'}>
                  {registrationWindow.open ? 'Open' : 'Closed'}
                </Badge>
              </div>
              <p className="mt-0.5 text-sm text-ink-500 dark:text-ink-400">
                {registrationWindow.open
                  ? `Closes on ${registrationWindow.closesOn}`
                  : `Closed since ${registrationWindow.closesOn}`}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {submitted && (
        <Card className="border-emerald-200 bg-emerald-50/50 dark:border-emerald-800/60 dark:bg-emerald-950/30">
          <CardBody className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-400">Registration complete</p>
              <p className="text-sm text-emerald-700 dark:text-emerald-400/90">
                Your group "{groupName}" is now registered with {members.length} members.
              </p>
            </div>
          </CardBody>
        </Card>
      )}

      {registrationWindow.open && !submitted && (
        <>
          {/* Project Identity */}
          <Card>
            <CardHeader
              title="Project Identity"
              subtitle="Basic information about your project group"
            />
            <CardBody className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200">Group Name</label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => {
                    setGroupName(e.target.value);
                    setErrors({ memberErrors: [] });
                  }}
                  placeholder="e.g. Neural Knights"
                  className={`input-field ${errors.groupName ? 'input-field-error' : ''}`}
                />
                {errors.groupName && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.groupName}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200">Elective Subject</label>
                <select
                  value={members[0]?.elective ?? ''}
                  onChange={(e) => {
                    setMembers((prev) => prev.map((m) => ({ ...m, elective: e.target.value })));
                    setErrors({ memberErrors: [] });
                  }}
                  className="input-field"
                >
                  <option value="">Select an elective...</option>
                  {electives.map((el) => (
                    <option key={el.id} value={el.label}>
                      {el.label} ({el.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200">
                  One-Line Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setErrors({ memberErrors: [] });
                  }}
                  rows={2}
                  placeholder="Briefly describe what your project does..."
                  className={`input-field resize-none ${errors.description ? 'input-field-error' : ''}`}
                />
                {errors.description && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.description}
                  </p>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Team Members */}
          <Card>
            <CardHeader
              title="Team Members"
              subtitle="Add 3 to 4 members including yourself"
              action={
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={addMember}
                  disabled={members.length >= 4}
                >
                  <Plus className="h-4 w-4" />
                  Add member
                </Button>
              }
            />
            <CardBody className="space-y-4">
              {errors.members && (
                <div className="flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2.5 text-sm text-rose-700 dark:bg-rose-950/60 dark:text-rose-400">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {errors.members}
                </div>
              )}

              {members.map((member, idx) => (
                <div key={member.id} className="rounded-xl border border-ink-200 p-4 dark:border-ink-700">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700 dark:bg-brand-950/50 dark:text-brand-300">
                        {idx + 1}
                      </span>
                      <span className="text-sm font-medium text-ink-600 dark:text-ink-300">Member {idx + 1}</span>
                    </div>
                    {members.length > 3 && (
                      <button
                        onClick={() => removeMember(member.id)}
                        className="text-ink-400 hover:text-rose-500 transition-colors dark:text-ink-500 dark:hover:text-rose-400"
                        aria-label="Remove member"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-ink-500 dark:text-ink-400">Name</label>
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) => updateMember(member.id, 'name', e.target.value)}
                        placeholder="Full name"
                        className={`input-field text-sm ${errors.memberErrors[idx]?.name ? 'input-field-error' : ''}`}
                      />
                      {errors.memberErrors[idx]?.name && (
                        <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.memberErrors[idx].name}</p>
                      )}
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-ink-500 dark:text-ink-400">Roll Number</label>
                      <input
                        type="text"
                        value={member.rollNumber}
                        onChange={(e) => updateMember(member.id, 'rollNumber', e.target.value)}
                        placeholder="e.g. CS21B1042"
                        className={`input-field text-sm ${errors.memberErrors[idx]?.rollNumber ? 'input-field-error' : ''}`}
                      />
                      {errors.memberErrors[idx]?.rollNumber && (
                        <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                          {errors.memberErrors[idx].rollNumber}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-ink-500 dark:text-ink-400">Email</label>
                      <input
                        type="email"
                        value={member.email}
                        onChange={(e) => updateMember(member.id, 'email', e.target.value)}
                        placeholder="name@university.edu"
                        className={`input-field text-sm ${errors.memberErrors[idx]?.email ? 'input-field-error' : ''}`}
                      />
                      {errors.memberErrors[idx]?.email && (
                        <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.memberErrors[idx].email}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>

          {/* One-way action warning */}
          <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-800/60 dark:bg-amber-950/30">
            <CardBody className="flex items-start gap-3">
              <ShieldAlert className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-400">This action is irreversible</p>
                <p className="mt-1 text-sm text-amber-700 dark:text-amber-400/90">
                  Once you submit, your group name, elective, description, and member list cannot be
                  changed. Please double-check everything before confirming.
                </p>
              </div>
            </CardBody>
          </Card>

          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => showToast('Draft discarded.', 'info')}>
              Discard
            </Button>
            <Button onClick={handleSubmitClick}>
              <Lock className="h-4 w-4" />
              Submit Registration
            </Button>
          </div>
        </>
      )}

      {!registrationWindow.open && (
        <Card>
          <CardBody className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 dark:bg-rose-950/60 dark:text-rose-400">
              <Lock className="h-7 w-7" />
            </div>
            <h3 className="font-display font-semibold text-ink-700 dark:text-ink-200">Registration is closed</h3>
            <p className="mt-1.5 max-w-sm text-sm text-ink-500 dark:text-ink-400">
              The registration window has ended. If you believe this is an error, contact your
              project coordinator.
            </p>
          </CardBody>
        </Card>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Confirm group registration?"
        message={
          <div className="space-y-2">
            <p>
              You are about to register group <strong>"{groupName}"</strong> with{' '}
              <strong>{members.length} members</strong>.
            </p>
            <p className="text-amber-600 dark:text-amber-400">
              This cannot be undone. Your group name, elective, and team members will be locked.
            </p>
          </div>
        }
        confirmLabel="Confirm & Lock"
        cancelLabel="Go back"
        onConfirm={handleConfirmSubmit}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
