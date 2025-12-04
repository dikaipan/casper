/**
 * Utility functions for managing viewed tickets in localStorage
 * Tracks which tickets have been viewed by the user to control badge notifications
 */

const VIEWED_TICKETS_KEY = 'viewed_tickets';

/**
 * Get all viewed ticket IDs from localStorage
 */
export function getViewedTickets(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  
  try {
    const stored = localStorage.getItem(VIEWED_TICKETS_KEY);
    if (!stored) return new Set();
    
    const viewedIds = JSON.parse(stored) as string[];
    return new Set(viewedIds);
  } catch (error) {
    console.error('Error reading viewed tickets:', error);
    return new Set();
  }
}

/**
 * Mark a ticket as viewed
 */
export function markTicketAsViewed(ticketId: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const viewed = getViewedTickets();
    viewed.add(ticketId);
    
    // Store only the last 1000 viewed tickets to prevent localStorage from growing too large
    const viewedArray = Array.from(viewed);
    const trimmedArray = viewedArray.slice(-1000);
    
    localStorage.setItem(VIEWED_TICKETS_KEY, JSON.stringify(trimmedArray));
  } catch (error) {
    console.error('Error marking ticket as viewed:', error);
  }
}

/**
 * Mark multiple tickets as viewed
 */
export function markTicketsAsViewed(ticketIds: string[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    const viewed = getViewedTickets();
    ticketIds.forEach(id => viewed.add(id));
    
    // Store only the last 1000 viewed tickets
    const viewedArray = Array.from(viewed);
    const trimmedArray = viewedArray.slice(-1000);
    
    localStorage.setItem(VIEWED_TICKETS_KEY, JSON.stringify(trimmedArray));
  } catch (error) {
    console.error('Error marking tickets as viewed:', error);
  }
}

/**
 * Check if a ticket has been viewed
 */
export function isTicketViewed(ticketId: string): boolean {
  const viewed = getViewedTickets();
  return viewed.has(ticketId);
}

/**
 * Clear all viewed tickets (useful for testing or reset)
 */
export function clearViewedTickets(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(VIEWED_TICKETS_KEY);
  } catch (error) {
    console.error('Error clearing viewed tickets:', error);
  }
}

