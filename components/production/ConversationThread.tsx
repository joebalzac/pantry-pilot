'use client';

import { ArrowDown, MessageSquarePlus, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ApiError, apiGet, describeError, isAbortError, toApiError } from '../../lib/api/client';
import { parseThreadPage, type ThreadMessage } from '../../lib/api/schema';
import { formatCount } from '../../lib/format';
import { Button, Card, CardHeader, ErrorState, Notice, Skeleton } from '../ui';

const PAGE_SIZE = 30;
const LOAD_AHEAD_PX = 240;
const NEAR_BOTTOM_PX = 80;
const COLLAPSE_OVER_CHARS = 320;

const dayFormat = new Intl.DateTimeFormat('en-US', {weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'});
const timeFormat = new Intl.DateTimeFormat('en-US', {hour: 'numeric', minute: '2-digit'});

function Message({message}: {message: ThreadMessage}) {
  const [expanded, setExpanded] = useState(false);
  const collapsible = message.body.length > COLLAPSE_OVER_CHARS;
  return (
    <article className="thread-msg" data-mine={message.author === 'You'}>
      <p className="thread-msg__meta">
        <strong>{message.author}</strong> · {timeFormat.format(new Date(message.sentAt))}
      </p>
      <p className="thread-msg__body" dir="auto" data-collapsed={collapsible && !expanded}>
        {message.body}
      </p>
      {collapsible ? (
        <button
          type="button"
          className="thread-msg__more"
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      ) : null}
    </article>
  );
}

type PendingScroll = {type: 'bottom'} | {type: 'prepend'; height: number; top: number};

export function ConversationThread() {
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [prevCursor, setPrevCursor] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [initialState, setInitialState] = useState<'loading' | 'ready' | ApiError>('loading');
  const [initialAttempt, setInitialAttempt] = useState(0);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [olderError, setOlderError] = useState<ApiError | null>(null);
  const [failNext, setFailNext] = useState(false);
  const [unread, setUnread] = useState(0);
  const [announcement, setAnnouncement] = useState('');

  const scrollerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const inFlight = useRef<AbortController | null>(null);
  const pendingScroll = useRef<PendingScroll | null>(null);
  const atBottom = useRef(true);
  const incomingCount = useRef(0);

  useEffect(() => {
    const controller = new AbortController();
    setInitialState('loading');
    apiGet(`/api/lab/thread?limit=${PAGE_SIZE}`, parseThreadPage, {signal: controller.signal})
      .then(({data}) => {
        pendingScroll.current = {type: 'bottom'};
        setMessages(data.messages);
        setPrevCursor(data.prevCursor);
        setTotal(data.total);
        setInitialState('ready');
      })
      .catch((cause: unknown) => {
        if (!isAbortError(cause)) setInitialState(toApiError(cause));
      });
    return () => controller.abort();
  }, [initialAttempt]);

  // Runs before paint, so opening the thread or prepending history never flashes the wrong position.
  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    const pending = pendingScroll.current;
    if (!scroller || !pending) return;
    pendingScroll.current = null;
    scroller.scrollTop =
      pending.type === 'bottom' ? scroller.scrollHeight : pending.top + (scroller.scrollHeight - pending.height);
  }, [messages]);

  const loadOlder = useCallback(() => {
    if (inFlight.current || !prevCursor) return;
    const controller = new AbortController();
    inFlight.current = controller;
    setLoadingOlder(true);
    setOlderError(null);

    const params = new URLSearchParams({limit: String(PAGE_SIZE), before: prevCursor});
    if (failNext) params.set('scenario', 'server');
    setFailNext(false);

    apiGet(`/api/lab/thread?${params}`, parseThreadPage, {signal: controller.signal})
      .then(({data}) => {
        const scroller = scrollerRef.current;
        if (scroller) {
          pendingScroll.current = {type: 'prepend', height: scroller.scrollHeight, top: scroller.scrollTop};
        }
        setMessages((old) => [...data.messages, ...old]);
        setPrevCursor(data.prevCursor);
        setAnnouncement(`Loaded ${data.messages.length} older messages`);
      })
      .catch((cause: unknown) => {
        if (!isAbortError(cause)) setOlderError(toApiError(cause));
      })
      .finally(() => {
        if (inFlight.current === controller) inFlight.current = null;
        setLoadingOlder(false);
      });
  }, [prevCursor, failNext]);

  useEffect(() => () => inFlight.current?.abort(), []);

  // Pauses after a failure: auto-retrying while someone sits at the top would hammer a struggling API.
  // Re-created per page, because IntersectionObserver only fires on change and a short page may
  // leave the sentinel in view.
  useEffect(() => {
    const scroller = scrollerRef.current;
    const sentinel = sentinelRef.current;
    if (!scroller || !sentinel || !prevCursor || olderError) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) loadOlder();
      },
      {root: scroller, rootMargin: `${LOAD_AHEAD_PX}px 0px 0px 0px`},
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadOlder, prevCursor, olderError, initialState]);

  const onScroll = () => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    atBottom.current = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < NEAR_BOTTOM_PX;
    if (atBottom.current) setUnread(0);
  };

  const simulateIncoming = () => {
    incomingCount.current += 1;
    if (atBottom.current) pendingScroll.current = {type: 'bottom'};
    else setUnread((count) => count + 1);
    setTotal((count) => count + 1);
    setAnnouncement('New message from Sam');
    setMessages((old) => [
      ...old,
      {
        id: `incoming-${incomingCount.current}`,
        author: 'Sam',
        body: 'Just got to the store. Anything to add before I check out?',
        sentAt: new Date().toISOString(),
      },
    ]);
  };

  const jumpToLatest = () => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    scroller.scrollTop = scroller.scrollHeight;
    setUnread(0);
  };

  const failure = initialState instanceof ApiError ? initialState : null;

  return (
    <Card>
      <CardHeader
        eyebrow="Household thread"
        title="Infinite conversation"
        action={
          <span className="caption">
            {formatCount(messages.length)} of {formatCount(total)} loaded
          </span>
        }
      />
      <div className="prod-thread-controls">
        <Button
          variant="outline"
          size="sm"
          leadingIcon={<MessageSquarePlus size={14} />}
          disabled={initialState !== 'ready'}
          onClick={simulateIncoming}
        >
          Simulate new message
        </Button>
        <label className="prod-toggle">
          <input type="checkbox" checked={failNext} onChange={(event) => setFailNext(event.target.checked)} />
          Fail next page
        </label>
      </div>

      {initialState === 'loading' ? (
        <div className="thread-frame" role="status">
          <span className="visually-hidden">Loading conversation</span>
          <div className="thread" aria-hidden="true">
            {['55%', '70%', '40%', '62%', '48%'].map((width, index) => (
              <div key={index} className="thread-msg" data-mine={index % 3 === 1}>
                <Skeleton width="4rem" />
                <Skeleton width={width} />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {failure ? (
        <ErrorState
          title={describeError(failure).title}
          reference={failure.details.requestId}
          actions={
            <Button leadingIcon={<RefreshCw size={16} />} onClick={() => setInitialAttempt((value) => value + 1)}>
              Try again
            </Button>
          }
        >
          {describeError(failure).message}
        </ErrorState>
      ) : null}

      {initialState === 'ready' ? (
        <div className="thread-frame">
          <div
            ref={scrollerRef}
            className="thread"
            role="region"
            aria-label="Household conversation"
            aria-busy={loadingOlder}
            tabIndex={0}
            onScroll={onScroll}
          >
            <div ref={sentinelRef} className="thread__top">
              {olderError ? (
                <Notice
                  action={
                    <Button variant="secondary" size="sm" leadingIcon={<RefreshCw size={14} />} onClick={loadOlder}>
                      Retry
                    </Button>
                  }
                >
                  Couldn’t load older messages. Everything here is still safe.
                </Notice>
              ) : prevCursor ? (
                <Button variant="ghost" size="sm" disabled={loadingOlder} onClick={loadOlder}>
                  {loadingOlder ? 'Loading older messages…' : 'Load older messages'}
                </Button>
              ) : (
                <p className="caption">This is the start of your household thread.</p>
              )}
            </div>

            {messages.map((message, index) => {
              const day = dayFormat.format(new Date(message.sentAt));
              const showDay = index === 0 || dayFormat.format(new Date(messages[index - 1].sentAt)) !== day;
              return (
                <div key={message.id} className="thread-entry">
                  {showDay ? <p className="thread-day">{day}</p> : null}
                  <Message message={message} />
                </div>
              );
            })}
          </div>

          {unread > 0 ? (
            <button type="button" className="thread-jump" onClick={jumpToLatest}>
              <ArrowDown size={14} aria-hidden="true" />
              {unread} new {unread === 1 ? 'message' : 'messages'}
            </button>
          ) : null}
        </div>
      ) : null}

      <span className="visually-hidden" role="status">
        {announcement}
      </span>
    </Card>
  );
}
