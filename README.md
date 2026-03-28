<img width="2187" height="1265" alt="image" src="https://github.com/user-attachments/assets/76a229a9-2c08-4376-8b0a-0408f6126cfb" />

# FRC GraphQL App

Formerly named Phoenix Scouter, this app is designed to take in data for the **2026 REBULT FRC competition** to make data analysis easier for teams, while providing lots of additional features.

While this app is no longer in development, there are many features worth highlighting that showcase what was built.

Tech Stack: 
- Backend: **Apollo Server (GraphQL)** + **Prisma ORM** + Express + SQLite
- Frontend: **React** + Tailwind + Apollo Client + Zustand
- Vector Search: Vectra (local vector database)

# Features:
## AI-Powered Match Strategy Generation:

<img width="465" height="409" alt="image" src="https://github.com/user-attachments/assets/cd6de250-f646-40e3-8a74-4bac5013daa1" />

Given two 3-team alliances, the app collects all relevent information about the alliances, constructs a detailed prompt summarising 2026 REBUILT's rules and sends it to Gemini to return a full strategic breakdown, returned as **styled HTML that allows custom image embedding.** Gemini can even include quotes that were written in reports about a teams playstyle.


## Blue Alliance Integration:

<img width="1049" height="643" alt="image" src="https://github.com/user-attachments/assets/0793f565-7b7b-47cf-bcd6-dc572bdb3575" />

This app is heavily integrated with The Blue Alliance (TBA), a community-run platform that collects FRC competition data. On event initialization, the app pulls rankings, win/loss records, and more advanced stats, and full match schedules from TBA's API and populates the local database so everything is available offline and queryable through *GraphQL*.


## Vector-Based Team Similarity Search:
Teams are embedded as 7 dimensional vectors based on statistics collected within the app. Using Vectra, you can query for similar teams to any given team using distance measurements.


## Data Pipeline with Error Recovery: 
CSV scouting logs are parsed and batch-ingested via **Prisma transactions** (to avoid hitting SQLite's write limits when inserting hundreds of records at once). If something can't be resolved, it is put in a bucket, with the failure reason.


## Sentiment Analyis:

<img width="993" height="385" alt="image" src="https://github.com/user-attachments/assets/923af06a-8888-4484-ac83-1d719ccdb406" />

Reports written by scouts are run through **NLP sentiment analysis based on a custom ruling schema** (words like "crash" and "reliable"), to return a number representing how positive the report was, allowing the user to see how well a robot is viewed without having to read every note.


## Live Reloading:
The app reloads and fetches data live, such as rank, record, OPR breakdown, scout coverage, top ten rankings, match prediction and upcoming match schedule


# A Smart Workaround
<img width="1050" height="777" alt="image" src="https://github.com/user-attachments/assets/6fb52ffb-a5c4-49d6-8cd1-453de6dea94c" />

In the app, team logos are displayed as so. It is one of my favorite parts of the app, and looks pretty cool. However, it was not very simple to implement and took a few iterations to get right. 

First, I had the idea of simply using the Blue Alliance website, and simply using the images by setting the image src as the link to the image in The Blue Alliance. This did not work because TBA's server blocks **cross-origin requests (CORS)**, so the browser refuses to load the images.

The solution was to download all teams images in an event all at once, by sending **HTTP requests with a spoofed User-Agent header (mimicking a chrome browser)** since TBA rejects requests that don't look like theyre coming from a real browser. The images are then **downloaded locally into the SQLite database** as raw bytes, which is served back with a custom Express endpoint and reused freely with the React `<img src={'http://localhost:4000/avatar/${team.number}'} />`
