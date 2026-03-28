import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client/core'
import { ApolloProvider } from '@apollo/client/react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Setup from './pages/Setup'
import MainMenu from './pages/MainMenu'
import UnmatchedLogs from './pages/UnmatchedLogs'
import Dashboard from './pages/Dashboard'
import Teams from './pages/Teams'
import Matches from './pages/Matches'
import MatchDetail from './pages/MatchDetail'
import TeamDetail from './pages/TeamDetail'
import Layout from './components/Layout'
import './App.css'

const client = new ApolloClient({
  link: new HttpLink({ uri: 'http://localhost:4000/graphql' }),
  cache: new InMemoryCache(),
})

export default function App() {
  return (
    <ApolloProvider client={client}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Setup />} />
          <Route path="/menu" element={<MainMenu />} />
          <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
          <Route path="/teams" element={<Layout><Teams /></Layout>} />
          <Route path="/teams/:teamNumber" element={<Layout><TeamDetail /></Layout>} />
          <Route path="/matches" element={<Layout><Matches /></Layout>} />
          <Route path="/matches/:matchId" element={<Layout><MatchDetail /></Layout>} />
          <Route path="/unmatched-logs" element={
            <Layout>
              <UnmatchedLogs />
            </Layout>
          } />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </ApolloProvider>
  )
}
