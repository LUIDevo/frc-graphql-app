import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { gql } from '@apollo/client/core'
import { useMutation, useLazyQuery } from '@apollo/client/react'
import { useUserStore } from '../../store/useStore'

const ADD_USER = gql`
  mutation addUser($username: String!, $TBA_API_KEY: String!) {
    addUser(username: $username, TBA_API_KEY: $TBA_API_KEY) {
      id
      username
      TBA_API_KEY
    }
  }
`
const FIND_USER = gql`
  query { findUser }
`

export default function Setup() {
  const { teamNumber, setTeamNumber } = useUserStore()
  const [apiKey, setApiKey] = useState('')
  const navigate = useNavigate()

  const [findUser] = useLazyQuery(FIND_USER)
  const [addUser, { loading, error }] = useMutation(ADD_USER)

  useEffect(() => {
    findUser().then(({ data }) => {
      console.log(data?.findUser)
      if (data?.findUser > 0) navigate('/menu')
    })
  }, [])

  async function handleSubmit() {
    try {
      await addUser({ variables: { username: teamNumber, TBA_API_KEY: apiKey } })
      navigate('/menu')
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-5 p-8"
      style={{ background: 'var(--bg)', color: 'var(--text)' }}
    >
      {/* Logo mark */}
      <div
        className="w-10 h-10 rounded-[9px] flex items-center justify-center font-mono text-base font-bold text-white mb-1"
        style={{ background: 'linear-gradient(135deg, #991b1b 0%, #ef4444 55%, #fca5a5 100%)', boxShadow: '0 4px 14px rgba(239,68,68,0.35)' }}
      >
        P
      </div>

      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text)' }}>PhoenixScouter</h1>
        <p className="text-xs mt-1 font-mono" style={{ color: 'var(--text-muted)' }}>FRC · 2026 Season · Setup</p>
      </div>

      <div className="flex flex-col gap-3 w-64">
        <div className="flex flex-col gap-1">
          <label className="text-[11px]" style={{ color: 'var(--text-soft)' }}>Team Number</label>
          <input
            className="rounded-[5px] px-3 py-[7px] text-center font-mono text-xl tracking-widest outline-none transition-colors"
            style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }}
            onFocus={e => (e.target.style.borderColor = 'var(--accent-border)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            maxLength={4}
            placeholder="6632"
            value={teamNumber}
            onChange={(e) => setTeamNumber(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px]" style={{ color: 'var(--text-soft)' }}>TBA API Key</label>
          <input
            className="rounded-[5px] px-3 py-[7px] font-mono text-xs outline-none transition-colors"
            style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }}
            onFocus={e => (e.target.style.borderColor = 'var(--accent-border)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            placeholder="TBA API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </div>

        {error && <p className="text-xs font-mono" style={{ color: 'var(--c-red)' }}>{error.message}</p>}

        <button
          className="rounded-[5px] px-6 py-[7px] text-sm font-semibold text-white transition-colors disabled:opacity-40"
          style={{ background: 'var(--accent)' }}
          onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.background = 'var(--accent-hover)'; }}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
          onClick={handleSubmit}
          disabled={loading || !teamNumber || !apiKey}
        >
          {loading ? 'Saving…' : 'Continue →'}
        </button>
      </div>
    </div>
  )
}
