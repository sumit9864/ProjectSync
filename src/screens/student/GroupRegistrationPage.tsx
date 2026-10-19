import { useMemo, useState, type ReactNode } from 'react';
import { AlertTriangle, Check, ChevronDown, Plus } from 'lucide-react';
import { Badge, Button, Card, CardBody, PageHeader } from '@/components/ui/ui';

type Member = { crn: string; name: string; email: string };

const electiveTwoOptions = [
  'User Interface and User Experience',
  'Generative AI and Prompt Engineering',
  'High Performance Databases',
];
const electiveThreeOptions = [
  'Cloud computing',
  'Natural Language Processing',
  'High Performance Computing',
];
const emptyMember = (): Member => ({ crn: '', name: '', email: '' });

function Field({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-4 border-b border-ink-100 py-5 first:pt-0 last:border-b-0 dark:border-ink-800 md:grid-cols-[minmax(180px,0.8fr)_minmax(0,1.7fr)] md:items-start">
      <div>
        <p className="text-sm font-semibold text-ink-900 dark:text-ink-100">{label}</p>
        <p className="mt-1 max-w-xs text-xs leading-5 text-ink-500 dark:text-ink-400">
          {description}
        </p>
      </div>
      <div>{children}</div>
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  disabled = false,
  type = 'text',
}: {
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange?.(event.target.value)}
      placeholder={placeholder}
      className="input-field w-full min-w-0 disabled:cursor-not-allowed disabled:bg-ink-50 disabled:text-ink-500 dark:disabled:bg-ink-950"
    />
  );
}

function MemberFields({
  member,
  onChange,
}: {
  member: Member;
  onChange: (field: keyof Member, value: string) => void;
}) {
  return (
    <div className="grid gap-3 rounded-xl border border-ink-200 bg-ink-50/50 p-4 dark:border-ink-700 dark:bg-ink-950/40 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      <TextInput
        value={member.crn}
        onChange={(value) => onChange('crn', value)}
        placeholder="CRN No."
      />
      <TextInput
        value={member.name}
        onChange={(value) => onChange('name', value)}
        placeholder="Full name"
      />
      <TextInput
        value={member.email}
        onChange={(value) => onChange('email', value)}
        placeholder="Edu email"
        type="email"
      />
    </div>
  );
}

export function GroupRegistrationPage() {
  const [leaderCrn, setLeaderCrn] = useState('');
  const [electiveTwo, setElectiveTwo] = useState('');
  const [electiveThree, setElectiveThree] = useState('');
  const [members, setMembers] = useState<Member[]>([emptyMember(), emptyMember()]);
  const [submitted, setSubmitted] = useState(false);

  const ready = useMemo(
    () =>
      Boolean(
        leaderCrn &&
        electiveTwo &&
        electiveThree &&
        members.every((member) => member.crn && member.name && member.email)
      ),
    [leaderCrn, electiveTwo, electiveThree, members]
  );
  const updateMember = (index: number, field: keyof Member, value: string) =>
    setMembers((current) =>
      current.map((member, memberIndex) =>
        memberIndex === index ? { ...member, [field]: value } : member
      )
    );

  if (submitted) {
    const registeredMembers = [
      { crn: leaderCrn, name: 'Rushikesh Vasant Patil', email: 'rushikesh@edu.in' },
      ...members,
    ];
    return (
      <div className="animate-fade-in">
        <Card className="overflow-hidden border border-emerald-200 dark:border-emerald-800/60">
          <CardBody className="px-5 py-10 text-center sm:px-10 sm:py-14">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
              <Check />
            </div>
            <p className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-ink-500 dark:text-ink-400">
              Registration confirmed
            </p>
            <h1 className="mt-3 font-display text-3xl font-bold text-ink-900 dark:text-ink-100 sm:text-4xl">
              Your Project ID is: <span className="text-emerald-600 dark:text-emerald-400">1</span>
            </h1>
            <p className="mx-auto mt-3 max-w-lg text-sm text-ink-500 dark:text-ink-400">
              Your group was registered in FCFS order. The project ID is locked to your submission
              timestamp.
            </p>
            <div className="mx-auto mt-8 max-w-2xl rounded-xl border border-ink-200 text-left dark:border-ink-700">
              <div className="border-b border-ink-200 px-4 py-3 text-sm font-semibold text-ink-900 dark:border-ink-700 dark:text-ink-100">
                Registered group Â· {electiveTwo} Â· {electiveThree}
              </div>
              <div className="divide-y divide-ink-100 dark:divide-ink-800">
                {registeredMembers.map((member, index) => (
                  <div
                    key={`${member.crn}-${index}`}
                    className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
                  >
                    <span className="font-medium text-ink-900 dark:text-ink-100">
                      {member.name || 'Member'}
                    </span>
                    <span className="text-ink-500 dark:text-ink-400">
                      {member.crn} Â· {member.email}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mx-auto mt-6 flex max-w-2xl items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-left dark:border-amber-800/60 dark:bg-amber-950/30">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Take a screenshot or note this ID down. Group composition is now locked.
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <Card className="overflow-hidden border border-ink-100 dark:border-ink-800">
        <div className="flex items-start justify-between gap-4 border-b border-ink-100 px-5 py-5 dark:border-ink-800 sm:px-7">
          <PageHeader title="Group Registration" subtitle="Form your final year project group." />
          <Badge color="warning">Pending</Badge>
        </div>
        <CardBody className="px-5 py-6 sm:px-7">
          <Field
            label="Team Leader"
            description="Enter your CRN. Name and email are authenticated."
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <TextInput value="Rushikesh Vasant Patil" disabled />
                <span className="sr-only">Authenticated leader name</span>
              </div>
              <div>
                <TextInput value="rushikesh@edu.in" disabled />
                <span className="sr-only">Authenticated leader email</span>
              </div>
              <TextInput value={leaderCrn} onChange={setLeaderCrn} placeholder="CRN No." />
            </div>
          </Field>
          <Field label="Elective II" description="The first elective shared by all members.">
            <div className="relative">
              <select
                value={electiveTwo}
                onChange={(event) => setElectiveTwo(event.target.value)}
                className="input-field appearance-none"
              >
                <option value="">Select Elective II</option>
                {electiveTwoOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-3 size-4 text-ink-400" />
            </div>
          </Field>
          <Field label="Elective III" description="The second elective shared by all members.">
            <div className="relative">
              <select
                value={electiveThree}
                onChange={(event) => setElectiveThree(event.target.value)}
                className="input-field appearance-none"
              >
                <option value="">Select Elective III</option>
                {electiveThreeOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-3 size-4 text-ink-400" />
            </div>
          </Field>
          <Field label="Member 2 Details" description="CRN No, Name, and Edu Email.">
            <MemberFields
              member={members[0]}
              onChange={(field, value) => updateMember(0, field, value)}
            />
          </Field>
          <Field label="Member 3 Details" description="CRN No, Name, and Edu Email.">
            <MemberFields
              member={members[1]}
              onChange={(field, value) => updateMember(1, field, value)}
            />
          </Field>
          {members.length === 2 ? (
            <Field label="Member 4 Details" description="Add a fourth member if required.">
              <Button
                variant="secondary"
                onClick={() => setMembers((current) => [...current, emptyMember()])}
              >
                <Plus data-icon="inline-start" /> Add 4th Member
              </Button>
            </Field>
          ) : (
            <Field label="Member 4 Details" description="Add a fourth member if required.">
              <MemberFields
                member={members[2]}
                onChange={(field, value) => updateMember(2, field, value)}
              />
            </Field>
          )}
        </CardBody>
        <div className="flex flex-col gap-4 border-t border-ink-100 bg-ink-50/60 px-5 py-4 dark:border-ink-800 dark:bg-ink-950/50 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <p className="text-xs text-ink-500 dark:text-ink-400">
            Minimum 3 members required to generate ID.
          </p>
          <Button size="lg" onClick={() => setSubmitted(true)} disabled={!ready}>
            Register Group &amp; Get ID
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default GroupRegistrationPage;
