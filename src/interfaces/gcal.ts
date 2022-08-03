export interface OAuth {

}

export interface GCal {

}

export interface Calendar {

}

export interface CalendarListQuery {

}

export interface CalendarEvent {
    kind?: string
    etag?: string
    location?: string
    id?: string
    status?: string
    htmlLink?: string
    created?: string
    updated?: string
    summary?: string
    description?: string
    creator?:
    {
        email?: string
        displayName?: string
    }
    organizer?:
    {
        email?: string
        displayName?: string
        self?: boolean
    }
    start?: { 
        date?: string
        dateTime?: string
        timeZone?: string
    }
    end?: { 
        date?: string 
        dateTime?: string
        timeZone?: string
    }
    recurringEventId?: string
        originalStartTime?: { 
            date?: string
        }
    transparency?: string
    iCalUID?: string
    sequence?: number
    reminders?: { 
        useDefault?: boolean
    }
}

export interface ListEventQuery {
    calendarId?: string
    timeMin?: (string|Date)
    timeMax?: (string|Date)
    maxResults?: number
    singleEvents?: boolean
    orderBy?: ('startTime'|'endTime')
}