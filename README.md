# Throughline for SharePoint

Your personalized productivity hub for SharePoint and Microsoft Teams.

## Overview

Throughline brings together your calendar, emails, tasks, files, and team activity in one customizable dashboard. Organize your workspace with drag-and-drop cards, create custom categories, and stay on top of what matters most.

### Key Features

- **Personalized Dashboard** - View calendar events, emails, tasks, files, and team activity at a glance
- **Customizable Categories** - Create, rename, and organize categories to match your workflow
- **Drag-and-Drop Interface** - Easily reorder cards and categories with intuitive drag-and-drop
- **Card Visibility Control** - Show/hide cards and categories as needed
- **Personalized Greetings** - Time-based, multilingual, or friendly greeting options
- **Full Configuration Dialog** - Comprehensive card management in a dedicated full-screen dialog
- **Microsoft Graph Integration** - Real-time data from Outlook, Calendar, To Do, OneDrive, and more

## SharePoint Framework Version

![version](https://img.shields.io/badge/SPFx-1.20.0-green.svg)

## Applies to

- [SharePoint Framework](https://aka.ms/spfx)
- [Microsoft 365 tenant](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-developer-tenant)
- Microsoft Teams (Personal App & Tab)

## Prerequisites

- Node.js v18.17.1 or higher (but less than v19)
- SharePoint Online tenant with App Catalog
- Microsoft 365 admin approval for Graph API permissions

## Required API Permissions

The following Microsoft Graph permissions are required:

| Permission | Purpose |
|------------|---------|
| Calendars.Read | Display calendar events |
| Mail.Read | Show unread and flagged emails |
| Tasks.Read | Display tasks from Microsoft To Do |
| Files.Read.All | Show recent files and shared items |
| User.Read.All | Display team member information |
| Presence.Read.All | Show user presence status |
| People.Read | Access people data |
| Sites.Read.All | Display site activity |

## Installation

1. Clone this repository
2. Navigate to the solution folder
3. Install dependencies:
   ```bash
   npm install
   ```
4. Build the solution:
   ```bash
   gulp bundle --ship
   gulp package-solution --ship
   ```
5. Upload the `.sppkg` file from `sharepoint/solution` to your App Catalog
6. Approve the API permission requests in SharePoint Admin Center
7. Add the web part to a SharePoint page

## Development

To run the solution locally:

```bash
gulp serve
```

This will open the SharePoint Workbench where you can test the web part.

## Available Cards

| Card | Description |
|------|-------------|
| Today's Agenda | Upcoming calendar events for today |
| Upcoming Week | Calendar events for the next 7 days |
| Unread Inbox | Recent unread emails |
| Flagged Emails | Important flagged messages |
| My Tasks | Tasks from Microsoft To Do |
| Recent Files | Recently accessed documents |
| Shared With Me | Files shared by others |
| My Team | Team member presence and contact info |
| Site Activity | Recent activity on the current site |
| Quick Links | Customizable navigation links |

## Configuration Options

### Greeting Settings
- **Time-based**: Good morning/afternoon/evening
- **World Hello**: Rotating greetings in different languages
- **Friendly**: Casual, welcoming message
- **None**: No greeting displayed

### Card Management
- Drag cards between categories
- Create custom categories
- Toggle card and category visibility
- Customize card titles
- Delete/restore cards to Available Cards section

## Solution Structure

```
src/
├── webparts/
│   └── dashboardCards/
│       ├── components/        # React components for each card
│       ├── propertyPane/      # Configuration dialog & property pane
│       ├── services/          # Microsoft Graph service
│       ├── utils/             # Theme utilities
│       └── loc/               # Localization strings
```

## Version History

| Version | Date | Comments |
|---------|------|----------|
| 1.0.0 | February 2026 | Initial release |

## Disclaimer

**THIS CODE IS PROVIDED _AS IS_ WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

## References

- [SharePoint Framework Overview](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/sharepoint-framework-overview)
- [Microsoft Graph API](https://docs.microsoft.com/en-us/graph/overview)
- [Fluent UI React Components](https://react.fluentui.dev/)
- [Building for Microsoft Teams](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/build-for-teams-overview)
