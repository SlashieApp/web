## Linear

Linear is the PM centre. Other agents pick up tickets and update the board too. Also read the wiki page `00-Meta/Agent-Instructions.md`. Where that page disagrees with this section, this section wins.

- Before starting, re-read the ticket's current status, assignee, and latest comments. Skip it if another agent has claimed it (In Progress with a claim comment), unless that claim is over 24 hours old with no activity. Comment before taking a stale claim over.
- Claim it: move to In Progress and comment before coding. Name the agent. This Cursor project comments `Picked up by Cursor Project`.
- Comment progress and blockers on the ticket.
- When finished: push to `main`, comment the commit hash(es) and how it was verified, and move the ticket to In Review. Only Ryan moves a ticket to Done.
- Open a new ticket for new work found. Do not widen the ticket you are on.

## Web and Expo layout parity

Platform mechanics may differ between web and Expo (native modals, gestures, haptics). UI/UX layout must be the same: same fields, order, sections, copy, steps, and primary actions. If a screen cannot match, ask Ryan in Linear before diverging.
