# TMK — Enterprise Operations Intelligence Platform (Frontend)

React + TypeScript single-page application that gives the management of **Texnologik Metallar Kombinati** one operational view over the combine: production, energy, workforce, logistics and the third-party systems the plant depends on.

`src/pages` contains 19 page modules. The navigation exposes the following areas:

| Area | What it covers |
| --- | --- |
| Overview | Executive summary with tabs for energy resources, warehouse, production plan-vs-fact and per-shop data |
| Map | Geographic view of plant sites |
| Investment projects | Project portfolio tracking |
| Production | Plan versus actual output per product and month, with year-over-year deltas |
| Sales | Sales analytics |
| Exchange market | Commodity market indicators |
| Employees | Headcount per site, age and gender distribution, document-expiry alerts |
| Transport | Live fleet map with per-vehicle status and speed |
| Partners | Partner and contractor directory |
| Energy | Electricity, gas and solar consumption per facility, daily and monthly breakdowns |
| ESG Monitoring | Environmental, social and governance indicators |
| Cameras | Live PTZ and panoramic streams grouped by site |
| Integration monitoring | Health of every external data source |
| Settings | User, role and dashboard configuration |

The interface is available in Uzbek, Russian and English through i18next.

## Real-time layer

`src/hooks/useWebSocket.ts` wraps a socket.io connection to the tracking gateway and exposes connection state, the current fleet snapshot, the last update timestamp and manual sync controls.

| Event | Direction | Meaning |
| --- | --- | --- |
| `vehicleUpdates` | server to client | Full fleet snapshot, broadcast every 30 seconds |
| `vehicleDetails` | server to client | One vehicle, sent in response to a request |
| `syncResult` | server to client | Outcome of a manual synchronisation |
| `getVehicleDetails` | client to server | Request details for a single vehicle |
| `syncVehicles` | client to server | Trigger a synchronisation |
| `subscribe` | client to server | Narrow the stream to a set of vehicles |

Reconnection is attempted five times at two-second intervals. If the socket cannot be established the view falls back to REST polling and the connection state is shown explicitly as Live, Fallback or Offline, so an operator is never looking at stale data without knowing it.

## Integration monitoring

The plant has no single source of truth, so the platform reads from several upstream systems and tracks each one independently.

| Upstream | Provides |
| --- | --- |
| Wialon | GPS telematics for the vehicle fleet |
| 1C:ZUP | Headcount and HR records |
| Fusion Solar | Solar generation data |
| Camera platform | Site video streams |
| HET | Plant readings |

For each integration the monitor page shows the last successful sync, response latency, success and failure counts for the day, a 30-day trend and the raw error returned by the upstream. A broken credential or an expired token surfaces within seconds instead of being discovered in a monthly report.

## Stack

React 18, TypeScript, Tailwind CSS, React Router 6, TanStack Query, socket.io-client, MapLibre GL, Recharts, i18next, Framer Motion, Axios, Create React App.

## Running locally

```bash
npm install
npm start        # development server on port 3000
npm run build    # production bundle
```

Configuration is read from environment variables. Create your own `.env` from the values your backend exposes and keep it out of version control.
