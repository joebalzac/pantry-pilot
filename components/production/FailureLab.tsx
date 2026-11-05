'use client';

import { Check, Clock, Lock, LogIn, PackageOpen, RefreshCw, ShieldAlert, WifiOff } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { ApiError, apiGet, describeError, isAbortError, toApiError } from '../../lib/api/client';
import { parseInventoryPage, type InventoryPage } from '../../lib/api/schema';
import { formatQuantity } from '../../lib/format';
import { categoryLabel } from '../../lib/pantry';
import { CategoryGlyph } from '../CategoryGlyph';
import { Button, Card, CardHeader, Chip, ChipGroup, EmptyState, ErrorState, ItemList, ItemRow, ItemRowSkeleton } from '../ui';

const SCENARIOS = [
  {id: 'ok', label: 'Success'},
  {id: 'slow', label: 'Slow'},
  {id: 'empty', label: 'Empty'},
  {id: 'unauthorized', label: '401 Expired'},
  {id: 'forbidden', label: '403 No access'},
  {id: 'rate-limited', label: '429 Rate limited'},
  {id: 'server', label: '500 Server error'},
  {id: 'timeout', label: 'Timeout'},
  {id: 'network', label: 'Offline'},
  {id: 'malformed', label: 'Malformed data'},
] as const;

type ScenarioId = (typeof SCENARIOS)[number]['id'];

type Result =
  | {state: 'loading'}
  | {state: 'success'; page: InventoryPage; status: number; ms: number}
  | {state: 'error'; error: ApiError};

function urlFor(scenario: ScenarioId) {
  // `.invalid` is reserved and never resolves, so this is a genuine network failure.
  if (scenario === 'network') return 'https://pantrypilot.invalid/api/lab/inventory';
  return `/api/lab/inventory?limit=4&scenario=${scenario}`;
}

const ERROR_ICONS: Partial<Record<ApiError['kind'], ReactNode>> = {
  unauthorized: <LogIn size={22} />,
  forbidden: <Lock size={22} />,
  'rate-limited': <Clock size={22} />,
  network: <WifiOff size={22} />,
  schema: <ShieldAlert size={22} />,
};

function useCountdown(seconds: number | undefined) {
  const [remaining, setRemaining] = useState(seconds ?? 0);
  useEffect(() => {
    setRemaining(seconds ?? 0);
    if (!seconds) return;
    const timer = setInterval(() => {
      setRemaining((value) => {
        if (value <= 1) clearInterval(timer);
        return Math.max(0, value - 1);
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [seconds]);
  return remaining;
}

function FailureView({error, onRetry}: {error: ApiError; onRetry: () => void}) {
  const {title, message, recovery} = describeError(error);
  const wait = useCountdown(recovery === 'wait' ? (error.details.retryAfter ?? 5) : undefined);

  let actions: ReactNode = null;
  if (recovery === 'sign-in') {
    actions = (
      <Button leadingIcon={<LogIn size={16} />} onClick={onRetry}>
        Sign in again
      </Button>
    );
  } else if (recovery === 'wait') {
    actions = (
      <Button disabled={wait > 0} leadingIcon={<RefreshCw size={16} />} onClick={onRetry}>
        {wait > 0 ? `Try again in ${wait}s` : 'Try again'}
      </Button>
    );
  } else if (recovery === 'retry') {
    actions = (
      <Button leadingIcon={<RefreshCw size={16} />} onClick={onRetry}>
        Try again
      </Button>
    );
  }

  return (
    <ErrorState
      icon={ERROR_ICONS[error.kind]}
      title={title}
      actions={actions}
      reference={error.details.requestId}
    >
      {message}
    </ErrorState>
  );
}

export function FailureLab() {
  const [request, setRequest] = useState<{scenario: ScenarioId; recovered: boolean; attempt: number}>({
    scenario: 'server',
    recovered: false,
    attempt: 0,
  });
  const [result, setResult] = useState<Result>({state: 'loading'});

  const effective: ScenarioId = request.recovered ? 'ok' : request.scenario;
  const url = urlFor(effective);

  useEffect(() => {
    const controller = new AbortController();
    setResult({state: 'loading'});
    apiGet(url, parseInventoryPage, {signal: controller.signal})
      .then(({data, status, ms}) => setResult({state: 'success', page: data, status, ms}))
      .catch((error: unknown) => {
        if (!isAbortError(error)) setResult({state: 'error', error: toApiError(error)});
      });
    return () => controller.abort();
  }, [url, request.attempt]);

  let trace = 'Waiting for response…';
  if (result.state === 'success') {
    trace = `HTTP ${result.status} · ${result.ms} ms · ${result.page.items.length} rows validated`;
  } else if (result.state === 'error') {
    const {status, ms} = result.error.details;
    const outcome = status ? `HTTP ${status}` : 'No HTTP response';
    trace = `${outcome} · ${ms ?? 0} ms · ApiError(${result.error.kind}): ${result.error.message}`;
  }

  return (
    <Card>
      <CardHeader
        eyebrow="Live requests"
        title="Pick a failure"
        action={<span className="caption">Retrying recovers, so you can see the full loop</span>}
      />
      <ChipGroup label="API response scenarios">
        {SCENARIOS.map(({id, label}) => (
          <Chip
            key={id}
            selected={request.scenario === id}
            onClick={() => setRequest({scenario: id, recovered: false, attempt: 0})}
          >
            {label}
          </Chip>
        ))}
      </ChipGroup>

      <div className="prod-trace">
        <code>GET {url}</code>
        <code aria-live="polite">{trace}</code>
      </div>

      <div className="prod-result">
        {result.state === 'loading' ? <ItemRowSkeleton rows={4} /> : null}
        {result.state === 'error' ? (
          <FailureView
            key={result.error.details.requestId ?? result.error.kind}
            error={result.error}
            onRetry={() => setRequest((old) => ({...old, recovered: true, attempt: old.attempt + 1}))}
          />
        ) : null}
        {result.state === 'success' && result.page.items.length === 0 ? (
          <EmptyState icon={<PackageOpen size={22} />} title="Nothing in this household yet">
            An empty response is a valid answer, not an error, so it gets its own state.
          </EmptyState>
        ) : null}
        {result.state === 'success' && result.page.items.length > 0 ? (
          <ItemList>
            {result.page.items.map((item) => (
              <ItemRow
                key={item.id}
                icon={<CategoryGlyph category={item.category} icon={item.icon} />}
                title={item.name}
                meta={`${categoryLabel(item.category)} · ${item.daysLeft} days estimated`}
                quantity={formatQuantity(item.quantity, item.unit)}
              />
            ))}
          </ItemList>
        ) : null}
      </div>
      {request.recovered && result.state === 'success' ? (
        <p className="prod-recovered caption">
          <Check size={14} aria-hidden="true" /> Recovered after retry
        </p>
      ) : null}
    </Card>
  );
}
