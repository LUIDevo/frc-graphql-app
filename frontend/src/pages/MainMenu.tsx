import { gql } from '@apollo/client/core'
import { useQuery, useMutation } from '@apollo/client/react'
import { useNavigate } from 'react-router-dom'
import { useEventStore, useUserStore } from '../../store/useStore'

const GET_NEXT_EVENTS = gql`query { getNextEvents }`
const GET_PAST_EVENTS = gql`query { getPastEvents { name startDate endDate } }`
const ADD_EVENT = gql`
  mutation addEvent($eventKey: String!, $name: String!, $startDate: String!, $endDate: String!) {
    addEvent(eventKey: $eventKey, name: $name, startDate: $startDate, endDate: $endDate) {
      eventKey name startDate
    }
  }
`
const INITIALIZE_EVENT = gql`
  mutation initializeEvent($eventKey: String!) {
    initializeEvent(eventKey: $eventKey)
  }
`

interface TBAEvent {
  key: string
  event_code: string
  name: string
  start_date: string
  end_date: string
}

export default function MainMenu() {
  const navigate = useNavigate()
  const { teamNumber } = useUserStore()
  const { eventName, setEventKey, setEventName } = useEventStore()

  const { data: nextData, loading: nextLoading } = useQuery(GET_NEXT_EVENTS)
  const { data: pastData } = useQuery(GET_PAST_EVENTS)
  const [addEvent] = useMutation(ADD_EVENT)
  const [initializeEvent] = useMutation(INITIALIZE_EVENT)

  async function selectEvent(event: TBAEvent) {
    const key = '2026' + event.event_code
    setEventName(event.name)
    setEventKey(key)
    try {
      await addEvent({ variables: { eventKey: key, name: event.name, startDate: event.start_date, endDate: event.end_date } })
      await initializeEvent({ variables: { eventKey: key } })
    } catch (e) {
      console.error(e)
    }
    navigate('/dashboard')
  }

  return (
    <div
      className="min-h-screen p-8 flex flex-col gap-6"
      style={{ background: 'var(--bg)', color: 'var(--text)' }}
    >
      <div>
        <p className="font-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>
          PhoenixScouter · Team {teamNumber}
        </p>
        <h1 className="text-[28px] font-semibold tracking-tight leading-none" style={{ color: 'var(--text)' }}>
          Select Event
        </h1>
      </div>

      {eventName && (
        <section>
          <p className="font-mono text-[10px] uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
            Last Viewed
          </p>
          <button
            className="text-sm transition-colors text-left"
            style={{ color: 'var(--text-soft)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-soft)')}
            onClick={() => navigate('/dashboard')}
          >
            {eventName}
          </button>
        </section>
      )}

      <section>
        <p className="font-mono text-[10px] uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
          2026 Events
        </p>
        {nextLoading && <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>Loading…</p>}
        {nextData && !Array.isArray(nextData.getNextEvents) && (
          <p className="text-xs font-mono" style={{ color: 'var(--c-amber)' }}>
            TBA API error: {JSON.stringify(nextData.getNextEvents)}
          </p>
        )}
        {Array.isArray(nextData?.getNextEvents) && nextData.getNextEvents.length === 0 && (
          <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>No upcoming events found.</p>
        )}
        <ul className="flex flex-col">
          {Array.isArray(nextData?.getNextEvents) && nextData.getNextEvents.map((event: TBAEvent, i: number) => (
            <li key={i} style={{ borderBottom: '1px solid var(--border)' }}>
              <button
                className="w-full text-left flex justify-between items-baseline py-2 text-sm transition-colors group"
                style={{ color: 'var(--text-soft)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-soft)')}
                onClick={() => selectEvent(event)}
              >
                <span>{event.name}</span>
                <span className="font-mono text-[10px] ml-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                  {event.start_date} – {event.end_date}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {pastData?.getPastEvents?.length > 0 && (
        <section>
          <p className="font-mono text-[10px] uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
            Stored Events
          </p>
          <ul className="flex flex-col">
            {pastData.getPastEvents.map((event: { name: string }, i: number) => (
              <li key={i} className="py-1.5 text-sm" style={{ color: 'var(--text-soft)', borderBottom: '1px solid var(--border)' }}>
                {event.name}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
