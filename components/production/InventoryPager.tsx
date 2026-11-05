'use client';

import { ChevronLeft, ChevronRight, RefreshCw, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ApiError, apiGet, describeError, isAbortError, toApiError } from '../../lib/api/client';
import { parseInventoryPage, type InventoryPage } from '../../lib/api/schema';
import { formatBytes, formatCompact, formatCount, formatQuantity } from '../../lib/format';
import { categoryLabel } from '../../lib/pantry';
import { CategoryGlyph } from '../CategoryGlyph';
import {
  Button,
  Card,
  CardHeader,
  EmptyState,
  ErrorState,
  ItemList,
  ItemRow,
  ItemRowSkeleton,
  Notice,
  Stat,
  StatRow,
  TextField,
} from '../ui';

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 250;

/** `cursors` holds the cursor for every page up to and including the requested one. */
type PageRequest = {query: string; cursors: (string | null)[]; fail: boolean; attempt: number};
type LoadedPage = {page: InventoryPage; query: string; cursors: (string | null)[]; bytes: number};

export function InventoryPager() {
  const [search, setSearch] = useState('');
  const [failNext, setFailNext] = useState(false);
  const [request, setRequest] = useState<PageRequest>({query: '', cursors: [null], fail: false, attempt: 0});
  // The last page that loaded successfully. A failed request never clears it.
  const [loaded, setLoaded] = useState<LoadedPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const scrollToTop = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({limit: String(PAGE_SIZE)});
    const cursor = request.cursors[request.cursors.length - 1];
    if (request.query) params.set('q', request.query);
    if (cursor) params.set('cursor', cursor);
    if (request.fail) params.set('scenario', 'server');

    setLoading(true);
    apiGet(`/api/lab/inventory?${params}`, parseInventoryPage, {signal: controller.signal})
      .then(({data, bytes}) => {
        setLoaded({page: data, query: request.query, cursors: request.cursors, bytes});
        setError(null);
        setLoading(false);
      })
      .catch((cause: unknown) => {
        if (isAbortError(cause)) return;
        setError(toApiError(cause));
        setLoading(false);
      });
    return () => controller.abort();
  }, [request]);

  useEffect(() => {
    if (!scrollToTop.current) return;
    scrollToTop.current = false;
    const list = listRef.current;
    if (list && list.getBoundingClientRect().top < 0) list.scrollIntoView({block: 'start'});
  }, [loaded]);

  useEffect(() => {
    const query = search.trim();
    if (query === request.query) return;
    const timer = setTimeout(() => {
      setRequest({query, cursors: [null], fail: false, attempt: 0});
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search, request.query]);

  const navigate = (cursors: (string | null)[]) => {
    scrollToTop.current = true;
    setRequest({query: loaded?.query ?? '', cursors, fail: failNext, attempt: 0});
    setFailNext(false);
  };
  const retry = () => setRequest((old) => ({...old, fail: false, attempt: old.attempt + 1}));

  const page = loaded?.page;
  const pageNumber = loaded?.cursors.length ?? 1;
  const totalPages = page ? Math.max(1, Math.ceil(page.total / PAGE_SIZE)) : 1;
  const rangeStart = page && page.items.length > 0 ? (pageNumber - 1) * PAGE_SIZE + 1 : 0;
  const rangeEnd = page ? rangeStart + Math.max(0, page.items.length - 1) : 0;
  const fullPayload = page && page.items.length > 0 ? (loaded.bytes / page.items.length) * page.total : 0;

  const retryButton = (
    <Button variant="secondary" size="sm" leadingIcon={<RefreshCw size={14} />} onClick={retry}>
      Retry
    </Button>
  );

  return (
    <Card>
      <CardHeader
        eyebrow="10,000 records"
        title="Server-side pagination"
        action={<span className="caption">Cursor-based, 10 rows at a time</span>}
      />

      <StatRow>
        <Stat label="Records matching" value={page ? formatCompact(page.total) : '—'} />
        <Stat label="Rows rendered" value={page ? page.items.length : '—'} />
        <Stat label="This page" value={loaded ? formatBytes(loaded.bytes) : '—'} />
      </StatRow>
      <p className="caption prod-note">
        {fullPayload > 0
          ? `Sending every match at once would mean about ${formatBytes(fullPayload)} of JSON and ${formatCount(page?.total ?? 0)} rows in the DOM.`
          : 'Each request is capped by the server, whatever limit the client asks for.'}
      </p>

      <div className="inventory-toolbar">
        <TextField
          label="Search all 10,000 records on the server"
          hideLabel
          placeholder="Search on the server, try “salmon” or “reserve”…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          leadingIcon={<Search size={18} />}
        />
      </div>

      {error && loaded ? (
        <Notice action={retryButton}>
          Couldn’t load that page, so you’re still seeing the last results. {describeError(error).message}
        </Notice>
      ) : null}

      <div ref={listRef} className="prod-list" aria-busy={loading} data-loading={loading}>
        {!loaded && loading ? <ItemRowSkeleton rows={PAGE_SIZE} label="Loading inventory" /> : null}
        {!loaded && error ? (
          <ErrorState title={describeError(error).title} actions={retryButton}>
            {describeError(error).message}
          </ErrorState>
        ) : null}
        {page?.items.length === 0 ? (
          <EmptyState icon={<Search size={22} />} title="No records match">
            Nothing on the server matches “{loaded?.query}”.
          </EmptyState>
        ) : null}
        {page && page.items.length > 0 ? (
          <ItemList>
            {page.items.map((item) => (
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

      {page && page.items.length > 0 ? (
        <nav className="prod-pager" aria-label="Inventory pages">
          <p className="caption" aria-live="polite">
            {formatCount(rangeStart)}–{formatCount(rangeEnd)} of {formatCount(page.total)} · Page{' '}
            {formatCount(pageNumber)} of {formatCount(totalPages)}
          </p>
          <div className="prod-pager__actions">
            <label className="prod-toggle">
              <input type="checkbox" checked={failNext} onChange={(event) => setFailNext(event.target.checked)} />
              Fail next page
            </label>
            <Button
              variant="outline"
              size="sm"
              leadingIcon={<ChevronLeft size={14} />}
              disabled={pageNumber === 1}
              onClick={() => navigate(loaded.cursors.slice(0, -1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!page.nextCursor}
              onClick={() => navigate([...loaded.cursors, page.nextCursor])}
            >
              Next <ChevronRight size={14} aria-hidden="true" />
            </Button>
          </div>
        </nav>
      ) : null}
    </Card>
  );
}
